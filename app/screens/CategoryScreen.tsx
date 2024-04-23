import React, { FC, useCallback, useEffect, useMemo, useRef, useState } from "react"
import { observer } from "mobx-react-lite"
import { View, ViewStyle, StyleSheet, TextStyle, Dimensions, ActivityIndicator } from "react-native"
import { AppStackScreenProps } from "app/navigators"
import { Header, Text } from "app/components"
import { spacing } from "app/theme"
import { FlatGrid } from "react-native-super-grid"
import { useStores } from "app/models"
import { Category, api } from "app/services/api"
import {
  BottomSheetModal,
  BottomSheetModalProvider,
  BottomSheetTextInput,
  BottomSheetView,
} from "@gorhom/bottom-sheet"
import { TextInput, TouchableOpacity } from "react-native-gesture-handler"
import Toast from "react-native-toast-message"
import DateTimePicker from "react-native-modal-datetime-picker"
import { formatDateTime } from "app/utils/formatDate"
import EmojiPicker, { EmojiType } from "rn-emoji-keyboard"
import Modal from "react-native-modal"
import { Audio } from "expo-av"
import {
  AndroidAudioEncoder,
  AndroidOutputFormat,
  IOSOutputFormat,
  Recording,
} from "expo-av/build/Audio"

// import { useNavigation } from "@react-navigation/native"
// import { useStores } from "app/models"

const screenWidth = Dimensions.get("window").width

interface CategoryScreenProps extends AppStackScreenProps<"Category"> {}

export const CategoryScreen: FC<CategoryScreenProps> = observer(function CategoryScreen(_props) {
  const bottomSheetModalRef = useRef<BottomSheetModal>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [selected, setSelected] = useState<Category>()
  const [amount, setAmount] = useState<string>()
  const [date, setDate] = useState(new Date())
  const [emojiOpen, setEmojiOpen] = useState<boolean>(false)
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [newEmoji, setNewEmoji] = useState("🤖")
  const [newCategoryName, setNewCategoryName] = useState("")
  const snapPoints = useMemo(() => ["25%"], [])
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const [permissionResponse, requestPermission] = Audio.usePermissions()
  const [recording, setRecording] = useState<Recording>()

  const { navigation } = _props

  const {
    authenticationStore: { authToken },
  } = useStores()

  const fetchData = async () => {
    try {
      const response = await api.getCategory(authToken ?? "")
      setCategories(response?.results ?? [])
    } catch (error) {
      console.error("Error fetching categories:", error)
    }
  }

  useEffect(() => {
    fetchData()
    handlePresentModalPress(categories[0])
  }, [])

  useEffect(() => {
    setSelected(categories[0])
  }, [categories])

  function goBack() {
    navigation.goBack()
  }

  function isValidAmount(amount: string) {
    const regex = /^(0|[1-9]\d*)(\.\d{0,2})?$/
    return regex.test(amount)
  }

  function selectNewEmoji(emoji: EmojiType) {
    console.log(emoji.emoji)
    setNewEmoji(emoji.emoji)
  }

  async function add() {
    console.log("amount:", amount)
    console.log("recordedAt:", date)

    if (!isValidAmount(amount ?? "")) {
      Toast.show({
        type: "error",
        text1: "Failed",
        text2: "Not a valid amount",
      })
      return
    }

    const response = await api.postRecord(
      authToken ?? "",
      Number(amount),
      selected?.name ?? "",
      date.getTime() / 1000,
    )
    console.log(response)
    if (response?.results == "success") {
      Toast.show({
        type: "success",
        text1: "Success",
      })
      navigation.goBack()
    } else {
      Toast.show({
        type: "error",
        text1: "Failed",
        text2: response?.message,
      })
    }
  }

  const showDatePicker = () => {
    setDatePickerVisibility(true)
  }

  const hideDatePicker = () => {
    setDatePickerVisibility(false)
  }

  const handleConfirm = (date: Date) => {
    setDate(date)
    hideDatePicker()
  }

  const addMore = () => {
    setModalVisible(true)
  }

  const submitNewCategory = async () => {
    if (newCategoryName.length == 0) {
      Toast.show({
        type: "error",
        text1: "Failed",
        text2: "Enter a valid category name",
      })
      return
    }

    console.log(newCategoryName)
    console.log(newEmoji)

    const reponse = await api.postCategory(authToken ?? "", newCategoryName.trim(), newEmoji)
    if (reponse?.results == "success") {
      Toast.show({
        type: "success",
        text1: "Success",
      })
      setModalVisible(false)
      fetchData()
    } else {
      Toast.show({
        type: "error",
        text1: "Failed",
        text2: reponse?.message,
      })
    }
  }

  // callbacks
  const handlePresentModalPress = useCallback((category: Category) => {
    console.log(category)
    setSelected(category)
    bottomSheetModalRef.current?.present()
  }, [])
  const handleSheetChanges = useCallback((index: number) => {
    console.log("handleSheetChanges", index)
  }, [])

  const recordStart = async () => {
    console.log("start...")
    try {
      if (permissionResponse?.status !== "granted") {
        console.log("Requesting permission...")
        await requestPermission()
      }
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      })

      console.log("Starting recording..")

      const { recording } = await Audio.Recording.createAsync({
        isMeteringEnabled: true,
        android: {
          ...Audio.RecordingOptionsPresets.HIGH_QUALITY.android,
          extension: ".wav",
          outputFormat: AndroidOutputFormat.DEFAULT,
          audioEncoder: AndroidAudioEncoder.DEFAULT,
        },
        ios: {
          ...Audio.RecordingOptionsPresets.HIGH_QUALITY.ios,
          extension: ".wav",
          outputFormat: IOSOutputFormat.LINEARPCM,
        },
        web: {
          mimeType: "audio/wav",
          bitsPerSecond: 128000,
        },
      })

      setRecording(recording)
      console.log("Recording started")
    } catch (err) {
      console.error("Failed to start recording")
    }
  }

  const recordEnd = async () => {
    setIsLoading(true)
    console.log("Stopping recording..")
    setRecording(undefined)
    await recording?.stopAndUnloadAsync()
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
    })
    const uri = recording?.getURI()
    console.log("Recording stopped and stored at", uri)

    const response = await api.postRecordAudio(authToken ?? "", uri ?? "")
    console.log(response)

    if (response?.results == "success") {
      Toast.show({
        type: "success",
        text1: "Success",
      })
      goBack()
    } else {
      setIsLoading(false)
      Toast.show({
        type: "error",
        text1: "Failed",
        text2: response?.message,
      })
    }
  }
  return isLoading ? (
    <View style={{ flex: 1, justifyContent: "center" }}>
      <ActivityIndicator></ActivityIndicator>
    </View>
  ) : (
    <BottomSheetModalProvider>
      <Header
        title="Expenses"
        titleStyle={{ color: "black" }}
        leftIcon="back"
        onLeftPress={goBack}
        rightIcon="settings"
        onRightPress={addMore}
      />
      <FlatGrid
        itemDimension={80}
        data={categories}
        style={$gridView}
        // staticDimension={300}
        // fixed
        spacing={20}
        renderItem={({ item }) => (
          <TouchableOpacity style={$emojiName} onPress={() => handlePresentModalPress(item)}>
            <View style={$emojiView}>
              <Text style={$emoji}>{item.emoji}</Text>
            </View>
            <Text style={style.name} numberOfLines={1}>
              {item.name}
            </Text>
          </TouchableOpacity>
        )}
      />
      <BottomSheetModal
        ref={bottomSheetModalRef}
        index={0}
        snapPoints={snapPoints}
        onChange={handleSheetChanges}
      >
        <BottomSheetView style={$bottomSheetContainer}>
          <View style={$inputArea}>
            <View style={$selectedCategoryView}>
              <View style={$selectedCategoryEmojiAndName}>
                <Text style={$selectedCategoryEmoji}>{selected?.emoji}</Text>
                <Text numberOfLines={1}>{selected?.name}</Text>
              </View>
              <View style={$inputAmountView}>
                <Text style={style.dollarSign}>$</Text>
                <BottomSheetTextInput
                  value={amount}
                  onChangeText={setAmount}
                  style={style.amountField}
                  keyboardType="numeric"
                  placeholder="0"
                ></BottomSheetTextInput>
              </View>
            </View>
            <View style={$selectedCategoryView}>
              <View style={$selectedCategoryEmojiAndName}>
                <Text style={$selectedCategoryEmoji}>🕜</Text>
                <Text>Time</Text>
              </View>
              <View style={$inputAmountView}>
                <TouchableOpacity onPress={showDatePicker}>
                  <Text>{formatDateTime(date)}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
          <View style={$buttonArea}>
            <TouchableOpacity style={style.buttonStyle} onPress={add}>
              <Text style={style.buttonText}>Add</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={style.buttonStyle}
              onPressIn={recordStart}
              onPressOut={recordEnd}
            >
              <Text style={style.buttonText}>Audio Add</Text>
            </TouchableOpacity>
          </View>
        </BottomSheetView>
        <DateTimePicker
          date={date}
          isVisible={isDatePickerVisible}
          mode="datetime"
          onConfirm={handleConfirm}
          onCancel={hideDatePicker}
        />
      </BottomSheetModal>
      <Modal
        animationIn="slideInDown"
        isVisible={modalVisible}
        onBackdropPress={() => setModalVisible(false)}
      >
        <View style={style.centeredView}>
          <View style={style.modalView}>
            <TouchableOpacity
              onPress={() => {
                setEmojiOpen(true)
              }}
            >
              <Text style={style.modalText}>{newEmoji}</Text>
            </TouchableOpacity>

            <TextInput
              style={style.modalInput}
              placeholder="Enter new category name"
              value={newCategoryName}
              onChangeText={setNewCategoryName}
            ></TextInput>
            <TouchableOpacity style={[style.button, style.buttonClose]} onPress={submitNewCategory}>
              <Text style={style.textStyle}>Add Category</Text>
            </TouchableOpacity>
          </View>
        </View>
        <EmojiPicker
          onEmojiSelected={selectNewEmoji}
          open={emojiOpen}
          onClose={() => setEmojiOpen(false)}
        ></EmojiPicker>
      </Modal>
    </BottomSheetModalProvider>
  )
})

const $emojiName: ViewStyle = {
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  paddingHorizontal: spacing.md,
}

const $emojiView: ViewStyle = {
  width: 60,
  height: 60,
  backgroundColor: "#EFEBE9",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: 20,
  overflow: "hidden",
}

const $emoji: TextStyle = {
  fontSize: 30,
  color: "#000",
  lineHeight: 60,
  textAlign: "center",
}

const $gridView: ViewStyle = {
  marginTop: 10,
  flex: 1,
}

const $bottomSheetContainer: ViewStyle = {
  flex: 1,
  flexDirection: "column",

  alignItems: "center",
  // justifyContent: "space-between",
}

const $selectedCategoryView: ViewStyle = {
  width: screenWidth / 2 - 2 * spacing.sm,
  backgroundColor: "#EFEBE9",
  padding: spacing.md,
  marginHorizontal: spacing.sm,
  borderRadius: 15,
}

const $selectedCategoryEmojiAndName: ViewStyle = {
  flexDirection: "row",
  paddingBottom: 10,
}

const $selectedCategoryEmoji: ViewStyle = {
  paddingRight: spacing.xs,
}

const $inputAmountView: ViewStyle = {
  flexDirection: "row",
}

const $inputArea: ViewStyle = {
  flexDirection: "row",
}

const $buttonArea: ViewStyle = {
  flex: 1,
  flexDirection: "row",
  justifyContent: "space-around",
  alignItems: "center",
  width: screenWidth,
  marginTop: -spacing.md,
}

const style = StyleSheet.create({
  dollarSign: {
    fontSize: 18,
    fontWeight: "bold",
    paddingRight: 3,
  },
  amountField: {
    fontSize: 18,
    fontWeight: "bold",
    flex: 1,
    borderWidth: 0,
    borderColor: "transparent",
  },
  noteField: {
    fontSize: 14,
    flex: 1,
    borderWidth: 0,
    paddingTop: 5,
    borderColor: "transparent",
  },
  buttonStyle: {
    backgroundColor: "#A5D6A7",
    width: screenWidth / 2 - 2 * spacing.sm,
    borderRadius: 10,
    textAlign: "center",
    alignItems: "center",
    textAlignVertical: "center",
    height: spacing.xxl,
    justifyContent: "space-around",
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "900",
    textAlign: "center",
  },
  centeredView: {
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  button: {
    borderRadius: 15,
    padding: 10,
    elevation: 2,
  },
  buttonOpen: {
    backgroundColor: "#F194FF",
  },
  buttonClose: {
    backgroundColor: "#2196F3",
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  modalText: {
    fontSize: 60,
    textAlign: "center",
    lineHeight: 120,
  },
  modalInput: {
    fontSize: 16,
    fontWeight: "bold",
    paddingBottom: 20,
    width: 200,
    textAlign: "center",
  },
  name: {
    marginTop: 4,
    fontSize: 12,
    color: "black",
    textAlign: "center",
    overflow: "hidden",
  },
})
