import React from "react"
import { StyleProp, TextStyle, View, ViewStyle } from "react-native"
import { observer } from "mobx-react-lite"
import { Text } from "app/components/Text"
import { formateHourMinute } from "app/utils/formatDate"
import { spacing } from "app/theme"
import { ExpenseRecord } from "app/services/api"

export interface EachDayRecordsProps {
  style?: StyleProp<ViewStyle>
  expenses: ExpenseRecord[]
  date: string
}

export const EachDayRecords = observer(function EachDayRecords(props: EachDayRecordsProps) {
  const { style, expenses, date } = props

  // Sort expenses by recordedAt in descending order
  const sortedExpenses = expenses.slice().sort((a, b) => b.recordedAt - a.recordedAt)

  const totalExpenses = sortedExpenses.reduce((sum, expense) => sum + expense.amount, 0)

  return (
    <View style={$container}>
      <View style={$dateAndExpense}>
        <Text style={$date}>{date}</Text>
        <Text style={$totalExpenses}>-${totalExpenses.toFixed(2)}</Text>
      </View>
      {sortedExpenses.map((expense, index) => (
        <View
          key={`expense-${index}`} // Using index as part of key for better performance
          style={$expenseItem(index, sortedExpenses.length)}
        >
          <View style={$emojiCategory}>
            <Text style={$emoji}>{expense.emoji}</Text>
            <View style={$categoryTime}>
              <Text style={$category} numberOfLines={1}>
                {expense.category}
              </Text>
              <Text style={$time}>{formateHourMinute(expense.recordedAt)}</Text>
            </View>
          </View>
          <Text style={$amount}>-${expense.amount.toFixed(2)}</Text>
        </View>
      ))}
    </View>
  )
})

const $container: ViewStyle = {
  flex: 1,
}

const $dateAndExpense: ViewStyle = {
  flex: 1,
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  paddingTop: spacing.md,
}

const $date: TextStyle = {
  fontSize: 14,
  fontWeight: "bold",
  marginBottom: 10,
  paddingLeft: spacing.sm,
}

const $totalExpenses: TextStyle = {
  fontSize: 14,
  marginBottom: 10,
  paddingRight: spacing.sm,
}

const $expenseItem = (index: number, expensesLength: number): ViewStyle => ({
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  paddingVertical: 10,
  margin: 2,
  backgroundColor: "#EFEBE9",
  borderTopLeftRadius: index === 0 ? 20 : 2,
  borderTopRightRadius: index === 0 ? 20 : 2,
  borderBottomLeftRadius: index === expensesLength - 1 ? 20 : 2,
  borderBottomRightRadius: index === expensesLength - 1 ? 20 : 2,
})

const $category: TextStyle = {
  fontSize: 18,
}

const $amount: TextStyle = {
  fontSize: 16,
  fontWeight: "bold",
  paddingRight: spacing.md,
}

const $emoji: TextStyle = {
  fontSize: 20,
  paddingRight: spacing.md,
}

const $emojiCategory: ViewStyle = {
  flexDirection: "row",
  paddingLeft: spacing.md,
  alignItems: "center",
}

const $categoryTime: ViewStyle = {
  paddingHorizontal: 0,
}

const $time: TextStyle = {
  fontSize: 10,
  marginTop: -spacing.xxs,
}
