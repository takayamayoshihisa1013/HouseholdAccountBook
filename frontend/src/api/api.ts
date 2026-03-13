import App from "../App";

export type readFundProps = {
    id: number;
    year: number;
    month: number;
    added_amount: number;
}

export type updateFundProps = {
    year: number;
    month: number;
    added_amount: number;
}

export type transaction = {
    id: number;
    amount: number;
    store_name: string;
    date: string;
    cumulative: number;
}

export type months = {
    year: number;
    month: number;
}

export type totalAmount = {
    fund: number;
    transaction: number;
}

export type summary = {
    year: number;
    month: number;
    fund: number;
    total: number;
    carry_over_prev: number;
    carry_over_next: number;
}

export type chartData = {
    year: number;
    month: number;
    total: number;
}

export type store_name = {
    store_name: string;
}

const API_URL = "http://localhost:8000"

export async function createFund(year: number, month: number, amount: number) {
    const response = await fetch(`${API_URL}/funds`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            "year": year,
            "month": month,
            "added_amount": amount
        })
    })

    if (!response.ok) {
        alert("追加できませんでした。すでに存在していないか確認してください");
        throw new Error("Failed to create fund");
        
    }

    return response.json();
}

export async function readFund(year: number, month: number): Promise<readFundProps> {
    const response = await fetch(`${API_URL}/funds?year=${year}&month=${month}`);
    return response.json();
}

export async function updateFund(year: number, month: number, added_amount: number): Promise<updateFundProps> {
    const response = await fetch(`${API_URL}/funds/${year}/${month}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            added_amount: added_amount
        })
    })

    return response.json();
}

export async function deleteFund(year: number, month: number): Promise<void> {
    const response = await fetch(`${API_URL}/funds/${year}/${month}`, {
        method: "DELETE",
    });
    return response.json();
}

export async function createTransaction(amount: number, store_name: string, date: string, fund_id: number): Promise<transaction> {
    const response = await fetch(`${API_URL}/transactions`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            "amount": amount,
            "store_name": store_name,
            "date": date,
            "fund_id": fund_id
        })
    });
    console.log(amount, store_name, date, fund_id);

    return response.json();
}

export async function readTransaction(year: number, month: number): Promise<transaction[]> {
    const response = await fetch(`${API_URL}/transactions?year=${year}&month=${month}`);
    return response.json();
}

export async function updateTransaction(transaction_id: number, amount?:number, store_name?: string, date?: string): Promise<transaction> {
    const response = await fetch(`${API_URL}/transactions/${transaction_id}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            amount: amount,
            store_name: store_name,
            date: date
        })
    });

    if (!response.ok) {
        throw new Error("Failed to update transaction");
    }

    return response.json();
}

export async function deleteTransaction(transaction_id: number): Promise<void> {
    const response = await fetch(`${API_URL}/transactions/${transaction_id}`, {
        method: "DELETE",
    });

    if (!response.ok) {
        throw new Error("Failed to delete transaction");
    }
}

export async function get_months(): Promise<months[]> {
    const response = await fetch(`${API_URL}/funds/months`);
    return response.json();
}

export async function getotalAmount(): Promise<totalAmount> {
    const response = await fetch(`${API_URL}/funds/totalAmount`);
    return response.json();
}

export async function getSummary(year: number, month: number): Promise<summary> {
    const response = await fetch(`${API_URL}/transactions/summary/${year}/${month}`);
    return response.json();
}

export async function get_chart(): Promise<chartData[]> {
    const response = await fetch(`${API_URL}/chart`);

    if (!response.ok) {
    throw new Error("Failed to fetch chart data");
    }
    
    return response.json();
}

export async function getExistCheck(year: number, month: number): Promise<boolean> {
    const response = await fetch(`${API_URL}/funds/exists/${year}/${month}`);
    const data = await response.json();
    return data.exists;
}

export async function get_store_name(): Promise<store_name[]> {
    const response = await fetch(`${API_URL}/transactions/storeNameList`);
    return response.json();
}