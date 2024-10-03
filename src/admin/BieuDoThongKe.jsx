import { Button, DatePicker, message, Space } from "antd";
import axios from "axios";
import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
const { RangePicker } = DatePicker;

function BieuDoLineChart() {
    const [chartData, setChartData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [dateRange, setDateRange] = useState([null, null]);

    const fetchData = async () => {
        try {
            const response = await axios.get('http://127.0.0.1:8080/manager/order/api/listorder/admin');
            if (response.data.code === 0) {
                const orders = response.data.body;
                const processedData = processOrders(orders);
                setChartData(processedData);
                setFilteredData(processedData);
                message.error('Lỗi kết nối Internet, vui lòng thử lại');
            }
        } catch (error) {
            message.error('Lỗi kết nối Internet, vui lòng thử lại');
        }
    };

    const processOrders = (orders) => {
        const summary = {};

        orders.forEach(order => {
            const date = order.time_user_buy;
            const amount = order.amount;
            const status = order.status;

            if (!summary[date]) {
                summary[date] = { date, completed: 0, processing: 0 };
            }

            if (status === 23) {
                summary[date].completed += amount;
            } else {
                summary[date].processing += amount;
            }
        });
        console.log(filteredData)
        return Object.values(summary);
    };

    const handleDateRangeChange = (dates) => {
        setDateRange(dates);
    };

    const handleFilter = () => {
        if (dateRange[0] && dateRange[1]) {
            const startDate = dateRange[0].format("DD/MM/YYYY");
            const endDate = dateRange[1].format("DD/MM/YYYY");

            // Filter data based on selected date range
            const filtered = chartData.filter(data => {
                return data.date >= startDate && data.date <= endDate;
            });
            setFilteredData(filtered);
        } else {
            message.warning("Vui lòng chọn khoảng thời gian");
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    return (
        <div style={{ width: '100%', height: '300px' }}>
            <Space>
                <h2>Thống kê theo khoảng thời gian</h2>
                <RangePicker onChange={handleDateRangeChange} />
                <Button onClick={handleFilter}>Thống kê</Button>
            </Space>

            <ResponsiveContainer width="100%" height="100%">
                <LineChart
                    data={filteredData}
                    margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="completed" stroke="#8884d8" activeDot={{ r: 8 }} name="Đơn hàng đã hoàn thành" />
                    <Line type="monotone" dataKey="processing" stroke="#82ca9d" name="Đơn hàng đang chờ xử lý" />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}

export default BieuDoLineChart;
