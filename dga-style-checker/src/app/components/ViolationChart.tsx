import { BarChart } from '@mantine/charts';

export default function ViolationChart(violationCounts: { ViolationType: string, Count: number }[]) {
    return <BarChart
        h={300}
        data={violationCounts}
        dataKey="month"
        series={[
            { name: 'Count', color: 'blue.6' },
        ]}
        tickLine="xy"
    />
}