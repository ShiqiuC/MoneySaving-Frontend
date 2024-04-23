import { observer } from "mobx-react-lite"
import React, { ComponentType, FC, useMemo, useRef, useState } from "react"
import { TextInput, TextStyle, ViewStyle } from "react-native"
import { Button, Icon, Screen, Text, TextField, TextFieldAccessoryProps } from "../components"
import { AppStackScreenProps } from "../navigators"
import { colors, spacing } from "../theme"
import { TouchableOpacity } from "react-native-gesture-handler"
import { api } from "app/services/api"
import Toast from "react-native-toast-message"

interface SignupScreenProps extends AppStackScreenProps<"Signup"> {}

export const SignupScreen: FC<SignupScreenProps> = observer(function SignupScreen(_props) {
  const { navigation } = _props
  const authPasswordInput = useRef<TextInput>(null)

  const [authEmail, setAuthEmail] = useState("")
  const [authEmailError, setAuthEmailError] = useState("")
  const [authPassword, setAuthPassword] = useState("")
  const [authPasswordError, setAuthPasswordError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isAuthPasswordHidden, setIsAuthPasswordHidden] = useState(true)


  async function signup() {
    if (authEmail == "" || authPassword == "") return
    if (authEmailError != "" || authPasswordError != "") return
    
    setIsSubmitting(true)
    const response = await api.signup(authEmail, authPassword)

    if (response?.results == "success") {
      Toast.show({
        type: 'success',
        text1: "Success",
        text2: "You have successfully signed up🎉"
      })
      setAuthPassword("")
      setAuthEmail("")
      navigation.navigate("Login")
    } else {
      Toast.show({
        type: 'error',
        text1: "Failed",
        text2: response?.message
      })
    }
    setIsSubmitting(false)
  }

  function goSignin() {
    navigation.navigate("Login")
  }

  function validateEmail() {
    if (authEmail.length === 0) setAuthEmailError("can't be blank")
    else if (authEmail.length < 6) setAuthEmailError("must be at least 6 characters")
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(authEmail))
      setAuthEmailError("must be a valid email address")
    else
      setAuthEmailError("")
  }

  function validateAndSetAuthEmail(text: string) {
    setAuthEmail(text)
    validateEmail()
  }

  function validatePassword() {
    if (authPassword.length === 0) setAuthPasswordError("can't be blank")
    else if (authPassword.length < 6) setAuthPasswordError("must be at least 6 characters")
    else
    setAuthPasswordError("")
  }

  function validateAndSetAuthPassword(text: string) {
    setAuthPassword(text)
    validatePassword()
  }

  const PasswordRightAccessory: ComponentType<TextFieldAccessoryProps> = useMemo(
    () =>
      function PasswordRightAccessory(props: TextFieldAccessoryProps) {
        return (
          <Icon
            icon={isAuthPasswordHidden ? "view" : "hidden"}
            color={colors.palette.neutral800}
            containerStyle={props.style}
            size={20}
            onPress={() => setIsAuthPasswordHidden(!isAuthPasswordHidden)}
          />
        )
      },
    [isAuthPasswordHidden],
  )

  const $disabledOpacity: ViewStyle = { opacity: 0.5 }

  return (
    <Screen
      preset="auto"
      contentContainerStyle={$screenContentContainer}
      safeAreaEdges={["top", "bottom"]}
    >
      <Text testID="signup-heading" tx="signupScreen.signUp" preset="heading" style={$signUp} />
      <Text tx="signupScreen.enterDetails" preset="subheading" style={$enterDetails} />

      <TextField
        value={authEmail}
        onChangeText={validateAndSetAuthEmail}
        containerStyle={$textField}
        autoCapitalize="none"
        autoComplete="email"
        autoCorrect={false}
        keyboardType="email-address"
        labelTx="signupScreen.emailFieldLabel"
        helper={authEmailError}
        status={authEmailError ? "error" : undefined}
        onSubmitEditing={() => authPasswordInput.current?.focus()}
      />

      <TextField
        ref={authPasswordInput}
        value={authPassword}
        onChangeText={validateAndSetAuthPassword}
        containerStyle={$textField}
        autoCapitalize="none"
        autoComplete="password"
        autoCorrect={false}
        secureTextEntry={isAuthPasswordHidden}
        labelTx="signupScreen.passwordFieldLabel"
        helper={authPasswordError}
        status={authPasswordError ? "error" : undefined}
        onSubmitEditing={signup}
        RightAccessory={PasswordRightAccessory}
      />

      <Button
        testID="signup-button"
        tx="signupScreen.tapToSignUp"
        style={$tapButton}
        preset="reversed"
        onPress={signup}
        disabled={isSubmitting}
        disabledStyle={$disabledOpacity}
      />

      <TouchableOpacity onPress={() => { 
        console.log("sign in")
        goSignin()
       }}>
        <Text style={$signupText}>Already have an account, sign in?</Text>
      </TouchableOpacity>
        
    </Screen>
  )
})

const $screenContentContainer: ViewStyle = {
  paddingVertical: spacing.xxl,
  paddingHorizontal: spacing.lg,
}

const $signUp: TextStyle = {
  marginBottom: spacing.sm,
}

const $enterDetails: TextStyle = {
  marginBottom: spacing.lg,
}


const $textField: ViewStyle = {
  marginBottom: spacing.lg,
}

const $tapButton: ViewStyle = {
  marginTop: spacing.xs,
}

const $signupText: TextStyle = {
  color: '#999999',
  marginTop: spacing.md,
  alignSelf: 'center',
}