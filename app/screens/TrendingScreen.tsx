import React, { FC, useEffect, useState } from "react"
import { observer } from "mobx-react-lite"
import { ActivityIndicator, Dimensions, View, ViewStyle } from "react-native"
import { AppStackScreenProps } from "app/navigators"
import { Header, Screen, TrendingDistribution, TrendingOverview } from "app/components"
import Carousel from "react-native-reanimated-carousel"
import { spacing } from "app/theme"
import { LineChart } from "react-native-chart-kit"
import { useStores } from "app/models"
import { ExpenseRecord, api } from "app/services/api"
import moment from "moment"
// import { useNavigation } from "@react-navigation/native"
// import { useStores } from "app/models"

interface TrendingScreenProps extends AppStackScreenProps<"Trending"> {}

const items = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
const width = Dimensions.get("window").width

export const TrendingScreen: FC<TrendingScreenProps> = observer(function TrendingScreen() {
  const [year, setYear] = useState(new Date().getFullYear())
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const [lastIndex, setLastIndex] = useState(0)
  const [topCategories, setTopCategories] = useState<ExpenseRecord[]>([])
  const [totalExpenses, setTotalExpenses] = useState<number>(1)
  const [totalExpensesRecords, setTotalExpensesRecords] = useState(0)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [data, setData] = useState({
    labels: ["January", "February", "March", "April", "May", "June", "July", "January", "January"],
    datasets: [
      {
        data: [20, 45, 28, 80, 99, 43, 99, 12, 43],
        color: (opacity = 1) => `rgba(51, 105, 30, ${opacity})`, // optional
        strokeWidth: 1, // optional
      },
    ],
    legend: [], // optional
  })

  const {
    authenticationStore: { authToken },
  } = useStores()

  const chartConfig = {
    backgroundGradientFrom: "#EFEBE9",
    backgroundGradientTo: "#EFEBE9",
    color: (opacity = 0) => `rgba(0, 0, 0, ${opacity})`,
    strokeWidth: 2, // optional, default 3
    barPercentage: 0.5,
    // useShadowColorFromDataset: false, // optional
  }

  const fetchData = async () => {
    try {
      console.log(authToken)
      const response = await api.getExpenses(year, month, authToken ?? "")
      console.log(year)
      console.log(month)
      console.log(response?.results)

      const days = moment(`${year}-${month}`, "YYYY-MM").daysInMonth()
      let label = Array.from({ length: days }, (_, index) => (index + 1).toString())
      const chartData = Array(days).fill(0)
      console.log(chartData)

      const responseRecord = await api.getExpensesRecord(year, month, authToken ?? "")
      responseRecord?.results.forEach((eachRecord) => {
        const indexDay = moment.unix((eachRecord.recordedAt ?? 1) / 1000).date() - 1
        chartData[indexDay] += eachRecord.amount
      })
      setData({
        labels: label,
        datasets: [
          {
            data: chartData,
            color: (opacity = 1) => `rgba(51, 105, 30, ${opacity})`, // optional
            strokeWidth: 1, // optional
          },
        ],
        legend: [], // optional
      })
      setTopCategories(response?.results.topCategories ?? [])
      setTotalExpenses(response?.results.totalExpenses ?? 1)
      setTotalExpensesRecords(response?.results.totalExpensesRecords ?? 0)
      setIsLoading(false)
    } catch (error) {
      console.error("Error fetching summary:", error)
    }
  }

  useEffect(() => {
    fetchData()
  }, [authToken, year, month])

  let labelIndex = 0
  let skipLabelEvery = 3

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
        renderItem={({ index }) => (
          <Screen preset="scroll" contentContainerStyle={$container}>
            <View style={$overview}>
              <TrendingOverview
                totalExpenses={totalExpenses.toFixed(2)}
                recordNumber={totalExpensesRecords}
                style={$overview}
              ></TrendingOverview>
            </View>

            <TrendingDistribution
              totalExpenses={totalExpenses}
              topCategories={topCategories}
            ></TrendingDistribution>
            <View style={$chartView}>
              <LineChart
                data={data}
                width={width - spacing.md * 2}
                height={220}
                chartConfig={chartConfig}
                style={{ borderRadius: 16 }}
                formatXLabel={(value) => {
                  let label = labelIndex % skipLabelEvery === 0 ? value : ""
                  labelIndex++
                  return label
                }}
                fromZero
              ></LineChart>
            </View>
          </Screen>
        )}
      />
    </>
  )
})

const $container: ViewStyle = {
  paddingHorizontal: spacing.md,
}

const $overview: ViewStyle = {
  marginBottom: spacing.md,
}

const $chartView: ViewStyle = {
  paddingTop: spacing.md,
  borderRadius: 20,
}
