import * as React from "react"
import { StyleProp, TextStyle, View, ViewStyle } from "react-native"
import { observer } from "mobx-react-lite"
import { colors, spacing, typography } from "app/theme"
import { Text } from "app/components/Text"

export interface TrendingOverviewProps {
  style?: StyleProp<ViewStyle>
  totalExpenses: string
  recordNumber: number
}

export const TrendingOverview = observer(function TrendingOverview(props: TrendingOverviewProps) {
  const { style, totalExpenses, recordNumber } = props

  function formatNumberAsCurrency(num: string): string {
    // Use a regular expression to insert commas for thousand separators
    const result: string = num.replace(/\B(?=(\d{3})+(?!\d))/g, ",")

    return "$" + result
  }
  return (
    <View style={$container}>
      <View style={$titleView}>
        <Text style={$title}>Apr Overview</Text>
      </View>
      <View style={$contentView}>
        <View style={$expenseAndIncomeView}>
          <View style={$expenseBox}>
            <Text style={$expenses} numberOfLines={1}>
              Expenses
            </Text>
            <Text style={$expensesAmount} numberOfLines={1}>
              {formatNumberAsCurrency(totalExpenses)}
            </Text>
          </View>
          <View style={$expenseBox}>
            <Text style={$expenses} numberOfLines={1}>
              Income
            </Text>
            <Text style={$expensesAmount} numberOfLines={1}>
              --
            </Text>
          </View>
        </View>
        <View style={$expenseAndIncomeView}>
          <View style={$expenseBox}>
            <Text style={$expenses} numberOfLines={1}>
              Balance
            </Text>
            <Text style={$expensesAmount} numberOfLines={1}>
              --
            </Text>
          </View>
          <View style={$expenseBox}>
            <Text style={$expenses} numberOfLines={1}>
              Times
            </Text>
            <Text style={$expensesAmount} numberOfLines={1}>
              {recordNumber}
            </Text>
          </View>
        </View>
      </View>
    </View>
  )
})

const $container: ViewStyle = {
  padding: spacing.sm,
  justifyContent: "center",
  backgroundColor: "#EFEBE9",
  borderRadius: 16,
}

const $titleView: ViewStyle = {}

const $title: TextStyle = {
  fontSize: 14,
}

const $contentView: ViewStyle = {}

const $expenseAndIncomeView: ViewStyle = {
  flexDirection: "row",
}

const $expenseBox: ViewStyle = {
  flex: 1,
  backgroundColor: "#EAE6E4",
  padding: spacing.xs,
  margin: spacing.xxs,
  borderRadius: 10,
}

const $expenses: TextStyle = {
  fontSize: 12,
  paddingBottom: spacing.xs,
  paddingLeft: spacing.xs,
}

const $expensesAmount: TextStyle = {
  fontSize: 20,
  fontWeight: "bold",
  paddingLeft: spacing.xs,
}
