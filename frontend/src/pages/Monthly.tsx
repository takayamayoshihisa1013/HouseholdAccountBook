import { useEffect, useRef, useState } from "react";
import { createTransaction, readFund, readTransaction, type transaction, type readFundProps, updateFund, getSummary, type summary, updateTransaction, deleteTransaction, type existCheck, getExistCheck, get_store_name } from "../api/api";
import { useNavigate, useParams } from "react-router-dom";
import "../css/Monthly.css";

export default function Monthly() {
    const { year, month } = useParams<{ year: string; month: string }>();
    const [transactionsData, setTransactionData] = useState<transaction[]>([]);
    const [total, setTotal] = useState<number>(0);

    const [date, setDate] = useState<string>("");
    const [storeName, setStoreName] = useState<string>("");
    const [amount, setAmount] = useState<string>("");

    const lastDay = new Date(Number(year), Number(month), 0).getDate();

    const [fundData, setFundData] = useState<readFundProps>();

    const [fund, setFund] = useState<string>("");

    const [summaryData, setSummaryData] = useState<summary>();

    const [isModalOpen, setIsModalOpen] = useState(false);

    const [editDate, setEditDate] = useState<string>("");
    const [editStoreName, setEditStoreName] = useState<string>("");
    const [editAmount, setEditAmount] = useState<string>("");
    const [editTransactionId, setEditTransactionId] = useState<number | null>(null);

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const [isTransactionDeleteOpen, setIsTransactionDeleteOpen] = useState(false);

    const tableWrapperRef = useRef<HTMLDivElement | null>(null);

    const [prevYM, setPrevYM] = useState<{ year: number; month: number } | null>(null);
    const [nextYM, setNextYM] = useState<{ year: number; month: number } | null>(null);
    const [hasPrev, setHasPrev] = useState<boolean>(false);
    const [hasNext, setHasNext] = useState<boolean>(false);

    const navigate = useNavigate();

    const [storeList, setStoreList] = useState<{ store_name: string }[]>([]);

    useEffect(() => {
        const fetchTransactions = async () => {
            if (!year || !month) return;

            const data = await readTransaction(Number(year), Number(month));
            setTransactionData(data);

            const cumulative_last = data.at(-1)?.cumulative ?? 0;
            setTotal(cumulative_last);

            const get_fund = await readFund(Number(year), Number(month));
            setFundData(get_fund);
            setFund(String(get_fund.added_amount))

            const get_summary = await getSummary(Number(year), Number(month));
            setSummaryData(get_summary);

            const currentDate = new Date(Number(year), Number(month) - 1);

            // 前月
            const prevDate = new Date(currentDate);
            prevDate.setMonth(prevDate.getMonth() - 1);
            const prevYear = prevDate.getFullYear();
            const prevMonth = prevDate.getMonth() + 1;

            // 次月
            const nextDate = new Date(currentDate);
            nextDate.setMonth(nextDate.getMonth() + 1);
            const nextYear = nextDate.getFullYear();
            const nextMonth = nextDate.getMonth() + 1;
            setPrevYM({ year: prevYear, month: prevMonth });
            setNextYM({ year: nextYear, month: nextMonth });

            const prevExists = await getExistCheck(prevYear, prevMonth);
            const nextExists = await getExistCheck(nextYear, nextMonth);

            setHasPrev(prevExists);
            setHasNext(nextExists);

            const store_name = await get_store_name();
            setStoreList(store_name);
        };

        fetchTransactions();
    }, [year, month]);

    const handleAddTransaction = async () => {

        if (!year || !month) return;

        if (!date) {
            alert("日付を入力してください")
            return;
        }

        if (Number(date) < 1 || Number(date) > lastDay) {
            alert("正しい日付を入力してください");
            return;
        }

        if (!storeName) {
            alert("店名を入力してください")
            return;
        }

        if (!amount) {
            alert("値段を入力してください")
            return;
        }

        if (!date || !storeName || !amount) return;

        const formattedDate = `${year}-${month.padStart(2, "0")}-${date.padStart(2, "0")}`

        await createTransaction(Number(amount), storeName, formattedDate, fundData?.id ?? 0);
        const data = await readTransaction(Number(year), Number(month));
        setTransactionData(data);

        const cumulative_last = data.at(-1)?.cumulative ?? 0;
        setTotal(cumulative_last);

        const get_summary = await getSummary(Number(year), Number(month));
        setSummaryData(get_summary);

        const store_name = await get_store_name();
        setStoreList(store_name);

        setStoreName("");
        setAmount("");

        if (tableWrapperRef.current) {
            tableWrapperRef.current.scrollTop =
                tableWrapperRef.current.scrollHeight;
        }
    }

    const handleUpdateFund = async () => {
        if (!year || !month || !fund) return;

        await updateFund(Number(year), Number(month), Number(fund));
        const get_fund = await readFund(Number(year), Number(month));
        setFundData(get_fund);
        setIsModalOpen(false);
        const get_summary = await getSummary(Number(year), Number(month));
        setSummaryData(get_summary);
    }

    const handleEditTransaction = async () => {
        if (!year || !month || !editTransactionId) return;

        if (editDate) {
            if (Number(editDate) < 1 || Number(editDate) > lastDay) {
                alert("正しい日付を入力してください");
                return;
            }
        }


        const formattedDate = editDate ? `${year}-${month.padStart(2, "0")}-${editDate.padStart(2, "0")}` : undefined;
        await updateTransaction(editTransactionId, editAmount ? Number(editAmount) : undefined, editStoreName || undefined, formattedDate);

        const data = await readTransaction(Number(year), Number(month));
        setTransactionData(data);

        const cumulative_last = data.at(-1)?.cumulative ?? 0;
        setTotal(cumulative_last);

        const get_summary = await getSummary(Number(year), Number(month));
        setSummaryData(get_summary);

        setIsEditModalOpen(false);

        setEditAmount("");
        setEditStoreName("");
        setEditDate("");
    }

    const handleDeleteTransaction = async () => {
        if (!editTransactionId) return;

        await deleteTransaction(editTransactionId);

        const data = await readTransaction(Number(year), Number(month));
        setTransactionData(data);

        const cumulative_last = data.at(-1)?.cumulative ?? 0;
        setTotal(cumulative_last);

        const get_summary = await getSummary(Number(year), Number(month));
        setSummaryData(get_summary);
        setIsEditModalOpen(false);
    }

    const [isStoreListOpen, setIsStoreListOpen] = useState(false);

    const filteredStores = storeList.filter((s) =>
        s.store_name.includes(storeName)
    )



    return (
        <div className="monthlyPage">
            <div className="backToHome">
                <p onClick={() => navigate("/")}>
                    <span className="material-symbols-outlined">
                        arrow_back_ios
                    </span>
                    <span>
                        Topへ戻る
                    </span>
                </p>
            </div>
            {isModalOpen && (
                <div className="modalOverlay" onClick={() => setIsModalOpen(false)}>
                    <div className="modalContent" onClick={(e) => e.stopPropagation()}>
                        <h2>月の予算を編集</h2>

                        <input
                            type="number"
                            placeholder="変更後の予算"
                            value={fund}
                            onChange={(e) => setFund(e.target.value)}
                        />

                        <button className="addBtn" onClick={() => handleUpdateFund()}>
                            追加
                        </button>
                    </div>
                </div>
            )}

            {isEditModalOpen && (
                <div className="modalOverlay" onClick={() => setIsEditModalOpen(false)}>
                    <div className="modalContent" onClick={(e) => e.stopPropagation()}>
                        <h2>
                            支出内容を編集
                            <span className="material-symbols-outlined pointer" onClick={() => setIsTransactionDeleteOpen(prev => !prev)}>
                                more_vert
                            </span>
                            {
                                isTransactionDeleteOpen && (
                                    <div className="deleteMenu">
                                        <p onClick={() => {
                                            handleDeleteTransaction();
                                            setIsTransactionDeleteOpen(false);
                                        }}>
                                            削除
                                        </p>
                                    </div>
                                )
                            }
                        </h2>
                        {year}/{month.padStart(2, "0")}/
                        <input type="number" className="addDate" placeholder="日付" min={1} max={lastDay} value={editDate} onChange={(e) => { setEditDate(e.target.value) }} />
                        <input type="text" className="addStoreName" placeholder="店名" value={editStoreName} onChange={(e) => setEditStoreName(e.target.value)} />
                        <input type="number" className="addAmount" placeholder="値段" value={editAmount} onChange={(e) => setEditAmount(e.target.value)} />
                        <button className="addBtn" onClick={() => handleEditTransaction()}>編集</button>
                    </div>
                </div>
            )}

            <section className="monthlyCards">
                <div className="arrow" onClick={() => navigate(`/month/${nextYM?.year}/${nextYM?.month}`)}>
                    {
                        hasNext && (
                            <>
                                <span className="material-symbols-outlined">
                                    arrow_back
                                </span>
                                <span>
                                    {nextYM?.month}月
                                </span>
                            </>
                        )
                    }
                </div>
                <div className="card mainTotal">
                    <p className="cardTitle">今月合計<span onClick={() => setIsModalOpen(true)} className="material-symbols-outlined">edit</span></p>
                    <p className={`cardAmount ${5000 > ((fundData?.added_amount ?? 0) + (summaryData?.carry_over_prev ?? 0)) - total ? "danger" : ""}`}>¥{total.toLocaleString()}/¥{((fundData?.added_amount ?? 0) + (summaryData?.carry_over_prev ?? 0)).toLocaleString()}</p>
                </div>
                <div className="card carryCard">
                    <div>
                        <p className="cardSubTitle">先月繰越</p>
                        <p className="carryAmount">¥{summaryData?.carry_over_prev?.toLocaleString() ?? 0}</p>
                    </div>

                    <div>
                        <p className="cardSubTitle">来月繰越</p>
                        <p className="carryAmount">¥{summaryData?.carry_over_next?.toLocaleString() ?? 0}</p>
                    </div>
                </div>
                <div className="arrow" onClick={() => navigate(`/month/${prevYM?.year}/${prevYM?.month}`)}>
                    {
                        hasPrev && (
                            <>
                                <span className="material-symbols-outlined">
                                    arrow_forward
                                </span>
                                <span className="prev_next_month">
                                    {prevYM?.month}月
                                </span>
                            </>
                        )
                    }

                </div>
            </section>

            <section className="addTransaction">
                {year}/{month.padStart(2, "0")}/
                <input type="number" className="addDate" placeholder="日付" min={1} max={lastDay} value={date} onChange={(e) => { setDate(e.target.value) }} />
                <div className="storeInputWrapper">
                    <input
                        type="text"
                        className="addStoreName"
                        placeholder="店名"
                        value={storeName}
                        onChange={(e) => {
                            setStoreName(e.target.value);
                            setIsStoreListOpen(true);
                        }}
                        onFocus={() => setIsStoreListOpen(true)}
                        onBlur={() => setTimeout(() => setIsStoreListOpen(false), 150)}
                    />

                    {storeName && (
                        <span
                            className="clearButton"
                            onClick={() => setStoreName("")}
                        >
                            ×
                        </span>
                    )}

                    {isStoreListOpen && filteredStores.length > 0 && (
                        <div className="dropdown">
                            {filteredStores.map((s) => (
                                <div
                                    key={s.store_name}
                                    className="dropdownItem"
                                    onClick={() => {
                                        setStoreName(s.store_name);
                                        setIsStoreListOpen(false);
                                    }}
                                >
                                    {s.store_name}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <input type="number" className="addAmount" placeholder="値段" value={amount} onChange={(e) => setAmount(e.target.value)} />
                <button onClick={() => handleAddTransaction()}>追加</button>
            </section>
            <section className="tableWrapper" ref={tableWrapperRef}>
                <table>
                    <thead>
                        <tr>
                            <th>日付</th>
                            <th>店名</th>
                            <th>値段</th>
                            <th>累計金額</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {transactionsData.map((t) => (
                            <tr key={t.id}>
                                <td>{t.date}</td>
                                <td>{t.store_name}</td>
                                <td>¥{t.amount.toLocaleString()}</td>
                                <td>¥{t.cumulative.toLocaleString()}</td>
                                <td onClick={() => { setEditTransactionId(t.id); setIsEditModalOpen(true); setEditDate(t.date.split("-")[2]); setEditStoreName(t.store_name); setEditAmount(String(t.amount)) }}><span className="material-symbols-outlined">edit</span></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>

        </div>
    );
}
