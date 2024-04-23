import * as React from "react"
import { StyleProp, TextStyle, View, ViewStyle } from "react-native"
import { observer } from "mobx-react-lite"
import { colors, spacing, typography } from "app/theme"
import { Text } from "app/components/Text"
import { ExpenseRecord } from "app/services/api"
import * as Progress from "react-native-progress"

export interface TrendingDistributionProps {
  /**
   * An optional style override useful for padding & margin.
   */
  style?: StyleProp<ViewStyle>
  topCategories: ExpenseRecord[]
  totalExpenses: number
}

/**
 * Describe your component here
 */
export const TrendingDistribution = observer(function TrendingDistribution(
  props: TrendingDistributionProps,
) {
  const { style, topCategories, totalExpenses } = props

  function formatNumberAsCurrency(num: number): string {
    // First, convert the number to a string
    const numStr: string = num.toString()

    // Use a regular expression to insert commas for thousand separators
    const result: string = numStr.replace(/\B(?=(\d{3})+(?!\d))/g, ",")

    return "$" + result
  }

  function calculatePercentage(total: number, amount: number): string {
    if (total === 0) {
      throw new Error("Total amount cannot be zero.")
    }
    const percentage = (amount / total) * 100
    return percentage.toFixed(2) + "%"
  }

  function calculateBar(total: number, amount: number): number {
    if (total === 0) {
      return 0
    }
    return amount / total
  }
  return (
    <View style={$container}>
      <View style={$titleView}>
        <Text style={$title}>Expenses distribution</Text>
      </View>
      <View style={$listView}>
        {topCategories.length === 0 ? (
          <Text>No Data</Text>
        ) : (
          topCategories.map((eachCategory, index) => {
            return (
              <View key={eachCategory.category} style={$categoryBox}>
                <Text style={$emoji}>{eachCategory.emoji}</Text>
                <View style={$detailView}>
                  <View style={$amountView}>
                    <View style={$amountAndPercent}>
                      <Text style={$categoryText}>{eachCategory.category}</Text>
                      <Text style={$percentText}>
                        {calculatePercentage(totalExpenses, eachCategory.amount)}
                      </Text>
                    </View>
                    <Text style={$categoryText}>{formatNumberAsCurrency(eachCategory.amount)}</Text>
                  </View>
                  <View style={$bar}>
                    <Progress.Bar
                      progress={calculateBar(totalExpenses, eachCategory.amount)}
                      borderWidth={0}
                      width={null}
                      color="#33691E"
                      unfilledColor="#E2DEDC"
                    />
                  </View>
                </View>
              </View>
            )
          })
        )}
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

const $listView: ViewStyle = {}

const $categoryBox: ViewStyle = {
  flexDirection: "row",
  backgroundColor: "#EAE6E4",
  marginVertical: spacing.xxs,
  paddingHorizontal: spacing.sm,
  borderRadius: 10,
}

const $emoji: TextStyle = {
  fontSize: 20,
  lineHeight: 45,
  alignContent: "center",
  paddingRight: spacing.md,
}

const $detailView: ViewStyle = {
  flex: 1,
}

const $amountView: ViewStyle = {
  flexDirection: "row",
  justifyContent: "space-between",
}

const $categoryText: TextStyle = {
  fontSize: 14,
  fontWeight: "bold",
  paddingRight: spacing.xxs,
}

const $percentText: TextStyle = {
  fontSize: 10,
}

const $amountAndPercent: ViewStyle = {
  flexDirection: "row",
  alignContent: "center",
  justifyContent: "center",
}

const $bar: ViewStyle = {
  paddingTop: spacing.xxs,
}
