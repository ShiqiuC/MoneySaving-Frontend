import React, { FC, useCallback, useEffect, useState } from "react"
import {
  ViewStyle,
  View,
  Text,
  TouchableOpacity,
  TextStyle,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
} from "react-native"
import { Screen, Header, EachDayRecords } from "../components"
import { DemoTabScreenProps } from "../navigators/DemoNavigator"
import { spacing } from "../theme"
import { ConvertedRecordResponse, api, convertRecords } from "app/services/api"
import { useStores } from "app/models"
import Icon from "react-native-vector-icons/AntDesign"
import { useFocusEffect } from "@react-navigation/native"
import Carousel from "react-native-reanimated-carousel"

const width = Dimensions.get("window").width

export const DetailScreen: FC<DemoTabScreenProps<"Details">> = function DetailScreen(_props) {
  const { navigation } = _props
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [year, setYear] = useState(new Date().getFullYear())
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const [expensesResult, setExpensesResult] = useState<ConvertedRecordResponse>({ results: {} })
  const [totalExpenses, setTotalExpenses] = useState<string>("0")
  const {
    authenticationStore: { authToken },
  } = useStores()
  const [lastIndex, setLastIndex] = useState(0)
  const items = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

  const fetchData = async () => {
    try {
      console.log(year)
      console.log(month)
      const response = await api.getExpensesRecord(year, month, authToken ?? "")
      if (response) {
        let total = 0
        response.results.forEach((each) => {
          total += each.amount
        })
        const sortedResults = convertRecords(response)
        console.log(sortedResults)
        setExpensesResult(sortedResults)
        setTotalExpenses(total.toFixed(2))
      } else {
        setExpensesResult({ results: {} }) // Set to default empty state on error
        setTotalExpenses("0")
      }
      setIsLoading(false)
    } catch (error) {
      console.error("Error fetching expenses:", error)
    }
  }

  useFocusEffect(
    useCallback(() => {
      fetchData()
    }, []),
  )

  useEffect(() => {
    fetchData()
  }, [year, month])

  function addExpense() {
    navigation.navigate("Category")
  }

  const handleScrollEnd = (index: number) => {
    setIsLoading(true)
    setMonth(index + 1) // Update current index
    if (lastIndex === 11 && index === 0) {
      setYear((prevYear) => prevYear + 1) // Increment year only if the transition is from December to January
    } else if (lastIndex === 0 && index === 11) {
      setYear((prevYear) => prevYear - 1)
    }
    setLastIndex(index) // Set the current index as the last index for the next cycle
  }

  return isLoading ? (
    <View style={{ flex: 1, justifyContent: "center" }}>
      <ActivityIndicator></ActivityIndicator>
    </View>
  ) : (
    <>
      <Header title={items[month - 1]} titleStyle={{ color: "black" }} />
      <Carousel
        loop
        width={width}
        data={items}
        defaultIndex={month - 1}
        scrollAnimationDuration={1000}
        onSnapToItem={handleScrollEnd}
        style={{ paddingBottom: 120 }}
        // panGestureHandlerProps={{
        //   activeOffsetX: [-width / 3, width / 3],
        // }}
        renderItem={({ index }) => (
          <Screen preset="scroll" contentContainerStyle={$container}>
            <View style={$totalExpenseArea}>
              <View style={$totalView}>
                <View style={$totalEmojiAndName}>
                  <Text style={$totalEmoji}>💸</Text>
                  <Text numberOfLines={1}>Expenses</Text>
                </View>
                <View style={$totalExpensesView}>
                  <Text style={styles.dollarSign}>$</Text>
                  <Text style={styles.expensesField}>{totalExpenses}</Text>
                </View>
              </View>
              <View style={$totalView}>
                <View style={$totalEmojiAndName}>
                  <Text style={$totalEmoji}>💰</Text>
                  <Text>Income</Text>
                </View>
                <View style={$totalExpensesView}>
                  <Text style={styles.dollarSign}>$</Text>
                  <Text style={styles.expensesField}>0</Text>
                </View>
              </View>
            </View>
            {expensesResult &&
            expensesResult.results &&
            Object.keys(expensesResult.results).length > 0 ? (
              Object.entries(expensesResult.results).map(([date, expenses]) => (
                <EachDayRecords key={date} expenses={expenses} date={date} />
              ))
            ) : (
              <View style={{ alignItems: "center", marginTop: 20 }}>
                <Text>
                  No expenses data available for {month}/{year}.
                </Text>
              </View>
            )}
          </Screen>
        )}
      />

      <TouchableOpacity style={$fab} onPress={addExpense}>
        <Icon name="edit" style={styles.fabIcon} size={20} />
        <Text style={$fabText}>Add</Text>
      </TouchableOpacity>
    </>
  )
}

const $container: ViewStyle = {
  // paddingTop: spacing.lg + spacing.xl,
  paddingHorizontal: spacing.md,
}

const $totalExpenseArea: ViewStyle = {
  flexDirection: "row",
  justifyContent: "space-between",
}

const $totalView: ViewStyle = {
  width: width / 2 - 2 * spacing.sm,
  backgroundColor: "#EFEBE9",
  padding: spacing.md,
  borderRadius: 15,
}

const $totalEmojiAndName: ViewStyle = {
  flexDirection: "row",
  paddingBottom: 10,
}

const $totalEmoji: ViewStyle = {
  paddingRight: spacing.xs,
}

const $totalExpensesView: ViewStyle = {
  flexDirection: "row",
}

const $fab: ViewStyle = {
  flexDirection: "row",
  position: "absolute",
  width: 100,
  height: 56,
  alignItems: "center",
  justifyContent: "center",
  right: 20,
  bottom: 20,
  backgroundColor: "#C8E6C9",
  borderRadius: 15,
  elevation: 8,
}

const $fabText: TextStyle = {
  fontSize: 16,
}

const styles = StyleSheet.create({
  fabIcon: {
    paddingRight: 10,
  },
  dollarSign: {
    fontSize: 18,
    fontWeight: "bold",
    paddingRight: 3,
  },
  expensesField: {
    fontSize: 18,
    fontWeight: "bold",
    flex: 1,
    borderWidth: 0,
    borderColor: "transparent",
  },
})
