import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import moment from 'moment';
import { DatePicker, Button, Space, Select } from 'antd';
import { CircleAlert } from 'lucide-react';

const { RangePicker } = DatePicker;

// Dữ liệu giả lập
const fakeOrders = [
    {
        order_id: 1832495,
        user_name: "Nguyễn Văn A",
        create_time: "2024-09-01T12:34:56Z",
        amount: 1500000, // Tính bằng đồng (VND)
        status: 11, // Đang chờ xác nhận
        address: {
            district: "Quận 1",
            commune: "Phường Bến Nghé",
            detailed: "123 Lê Lợi",
        },
        items: [
            { name: "Sách A", quantity: 2, price: 500000 },
            { name: "Sách B", quantity: 1, price: 500000 },
        ],
    },
    {
        order_id: 7775755,
        user_name: "Trần Thị B",
        create_time: "2024-09-02T09:22:12Z",
        amount: 2000000,
        status: 15, // Đã thanh toán online và đang chờ gửi hàng
        address: {
            district: "Quận 7",
            commune: "Phường Tân Phong",
            detailed: "456 Nguyễn Văn Linh",
        },
        items: [
            { name: "Sách C", quantity: 3, price: 600000 },
            { name: "Sách D", quantity: 1, price: 800000 },
        ],
    },
    {
        order_id: 7398664,
        user_name: "Phạm Minh C",
        create_time: "2024-09-03T10:15:00Z",
        amount: 1200000,
        status: 19, // Đang vận chuyển
        address: {
            district: "Quận 3",
            commune: "Phường Võ Thị Sáu",
            detailed: "789 Cách Mạng Tháng Tám",
        },
        items: [
            { name: "Sách E", quantity: 2, price: 600000 },
        ],
    },
    {
        order_id: 1891983,
        user_name: "Lê Văn D",
        create_time: "2024-09-04T08:45:30Z",
        amount: 3000000,
        status: 17, // Đang chuẩn bị đơn hàng
        address: {
            district: "Quận 4",
            commune: "Phường 13",
            detailed: "101 Nguyễn Tất Thành",
        },
        items: [
            { name: "Sách F", quantity: 5, price: 600000 },
        ],
    },
    {
        order_id: 7478329,
        user_name: "Ngô Thị E",
        create_time: "2024-09-05T14:20:00Z",
        amount: 1000000,
        status: 23, // Đơn hàng đã giao
        address: {
            district: "Quận 5",
            commune: "Phường 9",
            detailed: "321 Trần Hưng Đạo",
        },
        items: [
            { name: "Sách G", quantity: 2, price: 500000 },
        ],
    },
    {
        order_id: 4652846,
        user_name: "Đinh Văn F",
        create_time: "2024-09-06T11:00:00Z",
        amount: 500000,
        status: 25, // Đơn hàng hoàn tất
        address: {
            district: "Quận 6",
            commune: "Phường 5",
            detailed: "654 Nguyễn Chí Thanh",
        },
        items: [
            { name: "Sách H", quantity: 1, price: 500000 },
        ],
    },
    {
        order_id: 2272585,
        user_name: "Vũ Thị G",
        create_time: "2024-09-07T09:10:15Z",
        amount: 2500000,
        status: 21, // Đang giao hàng
        address: {
            district: "Quận 7",
            commune: "Phường Tân Hưng",
            detailed: "789 Huỳnh Tấn Phát",
        },
        items: [
            { name: "Sách I", quantity: 2, price: 1250000 },
        ],
    },
    {
        order_id: 4495761,
        user_name: "Bùi Văn H",
        create_time: "2024-09-08T16:30:20Z",
        amount: 1800000,
        status: 27, // Đơn hàng đã hủy
        address: {
            district: "Quận 8",
            commune: "Phường 4",
            detailed: "987 Dương Bá Trạc",
        },
        items: [
            { name: "Sách J", quantity: 3, price: 600000 },
        ],
    },
    {
        order_id: 4855858,
        user_name: "Phan Thị I",
        create_time: "2024-09-09T10:05:50Z",
        amount: 3500000,
        status: 15, // Đã thanh toán online và đang chờ gửi hàng
        address: {
            district: "Quận 9",
            commune: "Phường Tân Phú",
            detailed: "123 Đỗ Xuân Hợp",
        },
        items: [
            { name: "Sách K", quantity: 7, price: 500000 },
        ],
    },
    {
        order_id: 4649242,
        user_name: "Hoàng Văn J",
        create_time: "2024-09-10T13:45:00Z",
        amount: 4000000,
        status: 17, // Đang chuẩn bị đơn hàng
        address: {
            district: "Quận 10",
            commune: "Phường 14",
            detailed: "456 Lý Thái Tổ",
        },
        items: [
            { name: "Sách L", quantity: 8, price: 500000 },
        ],
    },
];


function BieuDoLineChart() {
    const [data, setData] = useState([]);
    const [barData, setBarData] = useState([]);
    const [dateRange, setDateRange] = useState([null, null]);
    const [viewMode, setViewMode] = useState('daily');
    const [allOrders, setAllOrders] = useState(fakeOrders);

    const processOrders = (orders) => {
        const [startDate, endDate] = dateRange;
        const stats = {};

        orders.forEach(order => {
            const orderDateTime = moment(order.create_time);

            if (startDate && orderDateTime.isBefore(startDate)) return;
            if (endDate && orderDateTime.isAfter(endDate)) return;

            let key;
            if (viewMode === 'hourly') {
                key = orderDateTime.format('YYYY-MM-DD HH:00');
            } else {
                key = orderDateTime.format('YYYY-MM-DD');
            }

            if (!stats[key]) {
                stats[key] = { hoanthanh: 0, choxuly: 0 };
            }

            const totalAmount = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

            if (order.status === 23) { // Completed orders
                stats[key].hoanthanh += totalAmount;
            } else { // Pending orders
                stats[key].choxuly += totalAmount;
            }
        });

        const chartData = Object.keys(stats).map(key => ({
            time: key,
            'Hoàn tất giao dịch': stats[key].hoanthanh,
            'Đang chờ xử lý': stats[key].choxuly
        })).sort((a, b) => moment(a.time).diff(moment(b.time)));

        setData(chartData);
        setBarData(chartData.map(({ time, 'Hoàn tất giao dịch': hoanthanh, 'Đang chờ xử lý': choxuly }) => ({
            time,
            hoanthanh,
            choxuly,
        })));
    };

    const handleDateRangeChange = (dates) => {
        setDateRange(dates);
    };

    const handleFilter = () => {
        processOrders(allOrders);
    };

    const handleViewModeChange = (value) => {
        setViewMode(value);
        processOrders(allOrders);
    };

    useEffect(() => {
        processOrders(allOrders);
    }, [allOrders]);

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            const filteredPayload = payload.filter(entry => {
                // Lọc để chỉ hiển thị giá trị đang hover (hoàn thành hoặc chờ xử lý)
                if (entry.dataKey === "Hoàn tất giao dịch" && entry.value > 0) {
                    return true;
                }
                if (entry.dataKey === "Đang chờ xử lý" && entry.value > 0) {
                    return true;
                }
                return false;
            });
    
            if (filteredPayload.length > 0) {
                return (
                    <div className="custom-tooltip" style={{ backgroundColor: 'white', padding: '10px', border: '1px solid #cccccc' }}>
                        <p className="label">{`${viewMode === 'hourly' ? 'Giờ' : 'Ngày'}: ${label}`}</p>
                        {filteredPayload.map((entry, index) => (
                            <p key={`item-${index}`} style={{ color: entry.color }}>
                                {`${entry.name}: ${entry.value.toLocaleString()} VND`}
                            </p>
                        ))}
                    </div>
                );
            }
        }
        return null;
    };
    

    return (
        <div style={{ backgroundColor: '#e6fffb', padding: '20px', borderRadius: '8px' }}>
            <h1>Thống kê doanh thu</h1>
            <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Doanh số bán hàng</h2>
            <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px' }}>
                <h3 style={{ textAlign: 'center', marginBottom: '20px' }}>
                    {viewMode === 'hourly' ? 'Doanh thu theo giờ' : 'Doanh thu theo ngày'}
                </h3>
                <p style={{ textAlign: 'center', color: '#888' }}>
                    {viewMode === 'hourly' ? 'Doanh thu của từng giờ trong ngày' : 'Doanh thu của từng ngày trong tháng'}
                </p>
                <Space style={{ marginBottom: '20px', display: 'flex', justifyContent: 'center' }}>
                    <RangePicker 
                        onChange={handleDateRangeChange}
                        showTime={{ format: 'HH:mm' }}
                        format="YYYY-MM-DD HH:mm"
                    />
                    <Button onClick={handleFilter}>Thống kê</Button>
                    <Select
                        defaultValue="daily"
                        style={{ width: 120 }}
                        onChange={handleViewModeChange}
                        options={[
                            { value: 'daily', label: 'Theo ngày' },
                            { value: 'hourly', label: 'Theo giờ' },
                        ]}
                    />
                </Space>
              
                <h3 style={{ textAlign: 'center', marginTop: '40px', marginBottom: '20px' }}>Số lượng đơn hàng theo trạng thái</h3>
                <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                            dataKey="time" 
                            tickFormatter={(time) => viewMode === 'hourly' ? moment(time).format('HH:00') : moment(time).format('YYYY-MM-DD')}
                        />
                        <YAxis />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Line type="monotone" dataKey="Hoàn tất giao dịch" stroke="#82ca9d" />
                        <Line type="monotone" dataKey="Đang chờ xử lý" stroke="#8884d8" />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

export default BieuDoLineChart;
