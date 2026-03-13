import { useState } from "react";
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from "recharts";
import { type chartData } from "../api/api";
import "../css/Chart.css";

type Props = {
    data: chartData[];
}

export function Chart({ data }: Props) {
    const [page, setPage] = useState(0);


    // chartDataを年と月でソートする
    const sorted = [...data].sort((a, b) => {
        if (a.year === b.year) return a.month - b.month;
        return a.year - b.year;
    });

    const total = sorted.length;
    const start = Math.max(total - 12 - page * 12, 0)
    const end = total - page * 12;
    const visibleData = sorted.slice(start, end).map(data => ({
        ...data,
        label: `${data.year}/${data.month}`
    }));

    return (
        <>
            <ResponsiveContainer width="100%" height={200}>
                <BarChart
                    data={visibleData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                >
                    <XAxis dataKey="label" />
                    <Tooltip />
                    <Bar dataKey="total" fill="#8884d8" />
                </BarChart>
            </ResponsiveContainer>
            <div className="chartButtons">
                <button disabled={start === 0} onClick={() => setPage(p => p + 1)}>
                    ← 過去
                </button>
                <button disabled={page === 0} onClick={() => setPage(p => p - 1)}>
                    最新 →
                </button>
            </div></>
    )
}