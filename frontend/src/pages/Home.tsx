import { useEffect, useState } from "react"
import { get_months, getotalAmount, type totalAmount, type months, createFund, deleteFund, type chartData, get_chart } from "../api/api"
import { useNavigate } from "react-router-dom"
import "../css/Home.css"
import { Chart } from "../components/Chart"

export default function Home() {
  const [monthsData, setMonthsData] = useState<months[]>([])
  const [totalAmountData, setTotalAmountData] = useState<totalAmount>()
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [year, setYear] = useState("");
  const [month, setMonth] = useState("");
  const [fund, setFund] = useState("");

  const [deleteMenuKey, setDeleteMenuKey] = useState<string | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);

  const navigate = useNavigate();

  const [chartData, setChartData] = useState<chartData[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const months = await get_months()
      const total = await getotalAmount()

      setMonthsData(months)
      setTotalAmountData(total)
    }

    fetchData()
  }, [])

  const percent =
    totalAmountData && totalAmountData.fund > 0
      ? (totalAmountData.transaction / totalAmountData.fund) * 100
      : 0

  const addFund = async () => {

    if (!year || !month || !fund) return;

    await createFund(Number(year), Number(month), Number(fund))

    const months = await get_months();
    setMonthsData(months);

    const data = await get_chart();
    setChartData(data)

    setYear("");
    setMonth("");
    setFund("");
    setIsModalOpen(false);
  }

  const handleDeleteFund = async (year: number, month: number) => {
    await deleteFund(year, month);
    const months = await get_months();
    setMonthsData(months);
    const data = await get_chart();
    setChartData(data);
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await get_chart();
        setChartData(data);
      } catch (error) {
        console.error("Error fetching chart data:", error);
      }
    }

    fetchData();
  }, [])

  const [deleteYM, setDeleteYM] = useState<{ year: number, month: number } | null>(null)

  return (
    <div className="homePage">
      <h1 className="title">家計簿アプリ</h1>
      {isModalOpen && (
        <div className="modalOverlay" onClick={() => setIsModalOpen(false)}>
          <div className="modalContent" onClick={(e) => e.stopPropagation()}>
            <h2>月の予算を追加</h2>

            <input
              type="number"
              placeholder="年"
              value={year}
              onChange={(e) => setYear(e.target.value)}
            />

            <input
              type="number"
              placeholder="月"
              min={1}
              max={12}
              value={month}
              onChange={(e) => setMonth(e.target.value)}
            />

            <input
              type="number"
              placeholder="予算"
              value={fund}
              onChange={(e) => setFund(e.target.value)}
            />

            <button className="addBtn" onClick={() => addFund()}>
              追加
            </button>
          </div>
        </div>
      )}
      {
        isDeleteModalOpen && (
          <div className="modalOverlay" onClick={() => setIsModalOpen(false)}>
            <div className="modalContent" onClick={(e) => e.stopPropagation()}>
              <h2>本当に削除しますか？</h2>
              <div className="fundDeleteModalBUtton">
                <button className="addBtn" onClick={() => setIsDeleteModalOpen(false)}>
                  キャンセル
                </button>

                <button className="addBtn" onClick={() => {
                  if (!deleteYM) return;

                  handleDeleteFund(deleteYM.year, deleteYM.month);
                  setIsDeleteModalOpen(false);
                  setDeleteMenuKey(null);
                }}
                >
                  削除
                </button>
              </div>

            </div>
          </div>
        )
      }

      <section className="chartWrapper">
        <Chart data={chartData} />
      </section>

      <section className="monthlyCard">
        <div className="monthCards" onClick={() => setIsModalOpen(true)}>
          ＋
        </div>
        {monthsData.map((m) => (
          <div
            key={`${m.year}-${m.month}`}
            className="monthCards"
            onClick={() => navigate(`/month/${m.year}/${m.month}`)}
          >
            {m.year}/{m.month}
            <div className="deleteFundMenu">
              <span
                className="material-symbols-outlined pointer fundDelete"
                onClick={(e) => {
                  const key = `${m.year}-${m.month}`;
                  setDeleteMenuKey(prevKey => prevKey === key ? null : key);
                  e.stopPropagation();
                  console.log(deleteMenuKey);
                }}
              >
                more_vert
              </span>
              {
                deleteMenuKey === `${m.year}-${m.month}` && (
                  <p className="pointer" onClick={(e) => {
                    setDeleteYM({ year: m.year, month: m.month });
                    setIsDeleteModalOpen(true);
                    e.stopPropagation();
                  }}>
                    削除する
                  </p>
                )
              }
            </div>
          </div>
        ))}
      </section>
    </div>
  )
}
