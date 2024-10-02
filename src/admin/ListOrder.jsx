import React, { useState, useEffect } from 'react';
import { Table, Typography, Spin, Alert, Button, Input, message, Modal, Select } from 'antd';
import axios from 'axios';

const { Title } = Typography;
const { Search } = Input;
const { Option } = Select;

const optionsStatusForUpdateOrder = [
    { label: 'đã thanh toán ', value: 15 },
    { label: 'Đang chuẩn bị đơn hàng', value: 17 },
    { label: 'Đang vận chuyển', value: 19 },
    { label: 'Đang giao hàng', value: 21 },
    { label: 'Đơn hàng đã hoàn tất', value: 23 },
    { label: 'Đơn hàng đã hủy', value: 25 },
];

// Dữ liệu giả lập


const initData = [
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



const ListOrder = () => {
    const [data, setData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [currentOrder, setCurrentOrder] = useState(null);
    const [status, setStatus] = useState(null);
    const [orderStatuses, setOrderStatuses] = useState({});

    const fetchOrders = async () => {
        try {
            const response = await axios.get('http://127.0.0.1:8080/manager/order/api/listorder/admin');
            if (response.data.code === 0) {
                const apiData = response.data.body.map(order => ({
                    ...order,
                    key: order.order_id,
                    create_time: new Date(order.create_time).toISOString(),
                    status: order.status
                }));
                const combinedData = [...apiData, ...initData];
                setData(combinedData);
                setFilteredData(combinedData);
            } else {
                throw new Error('Failed to fetch data from API');
            }
        } catch (err) {
            console.error('Error fetching data:', err);
            setError('Failed to fetch data. Using initial data only.');
            setData(initData);
            setFilteredData(initData);
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        fetchOrders();
    }, []);


    const updateStatusOrderById = (orderId, status) => {
        Modal.confirm({
            title: 'Xác Nhận Cập Nhật',
            content: `Bạn có chắc chắn muốn cập nhật trạng thái đơn hàng ${orderId} thành ${optionsStatusForUpdateOrder.find(option => option.value === status)?.label}?`,
            onOk: async () => {
                try {
                    message.success('Cập nhật trạng thái thành công!');
                    // Cập nhật lại dữ liệu trong danh sách nếu cần
                } catch (error) {
                    message.error('Có lỗi xảy ra: ' + error.message);
                }
            },
        });
    };

    const handleSearch = (value) => {
        const lowercasedValue = value.toLowerCase();
        const numericValue = parseFloat(value);

        const filtered = data.filter(order => {
            const orderIdMatches = order.order_id.toString().includes(value);
            const addressMatches =
                order.address.district.toLowerCase().includes(lowercasedValue) ||
                order.address.commune.toLowerCase().includes(lowercasedValue) ||
                order.address.detailed.toLowerCase().includes(lowercasedValue);
            const amountMatches =
                !isNaN(numericValue) && (order.amount / 100).toFixed(2).includes(numericValue.toString());

            return orderIdMatches || addressMatches || amountMatches;
        });
        setFilteredData(filtered);
    };

    const showModal = (order) => {
        setCurrentOrder(order);
        setIsModalVisible(true);
        setStatus(order.status);
    };

    const handleModalClose = () => {
        setIsModalVisible(false);
        setCurrentOrder(null);
        setStatus(null);
    };

    const handleStatusChange = (orderId, value) => {
        setOrderStatuses((prevStatuses) => ({
            ...prevStatuses,
            [orderId]: value,
        }));
    };

    const columns = [
        {
            title: 'Mã Đơn Hàng',
            dataIndex: 'order_id',
            key: 'order_id',
        },
        {
            title: 'Người mua',
            dataIndex: 'user_name',
            key: 'user_name'
        },
        {
            title: 'Thời gian mua hàng',
            dataIndex: 'create_time',
            key: 'create_time',
            render: text => new Date(text).toLocaleString(),
        },
        {
            title: 'Số Tiền',
            dataIndex: 'amount',
            key: 'amount',
            render: text => `${(text / 100).toFixed(2)} VND`,
        },
        {
            title: 'Trạng Thái',
            dataIndex: 'status',
            key: 'status',
            render: status => {
                switch (status) {
                    case 11: return 'Đang chờ xác nhận';
                    case 13: return 'Đang chờ thanh toán online';
                    case 15: return 'Đã thanh toán online và đang chờ gửi hàng';
                    case 17: return 'Đang chuẩn bị đơn hàng';
                    case 19: return 'Đang vận chuyển';
                    case 21: return 'Đang giao hàng';
                    case 23: return 'Đơn hàng đã giao';
                    case 25: return 'Đơn hàng hoàn tất';
                    case 27: return 'Đơn hàng đã hủy';
                    default: return 'Trạng thái không xác định';
                }
            },
        },

        {
            title: 'Cập nhật trạng thái',
            key: 'updateOrder',
            render: (text, record) => (
                <>
                    <Select
                        placeholder="Vui lòng chọn trạng thái đơn hàng"
                        value={orderStatuses[record.order_id] || undefined}
                        onChange={(value) => handleStatusChange(record.order_id, value)}
                        style={{ width: 200, marginRight: 8 }}
                    >
                        {optionsStatusForUpdateOrder.map(option => (
                            <Option key={option.value} value={option.value}>
                                {option.label}
                            </Option>
                        ))}
                    </Select>
                    <Button
                        type="primary"
                        onClick={() => updateStatusOrderById(record.order_id, orderStatuses[record.order_id])}
                        disabled={!orderStatuses[record.order_id]}
                    >
                        Cập nhật
                    </Button>
                </>
            ),
        },

        {
            title: '',
            key: 'action',
            render: (text, record) => (
                <Button
                    type="primary"
                    onClick={() => showModal(record)}
                >
                    Xem Chi Tiết
                </Button>
            ),
        },
    ];

    if (loading) return <Spin tip="Đang Tải..." />;
    if (error) return <Alert message="Lỗi" description={error} type="error" />;

    return (
        <div>
            <Title level={2}>Danh Sách Đơn Hàng</Title>
            <Search
                placeholder="Tìm kiếm theo mã đơn hàng, địa chỉ, hoặc giá tiền"
                allowClear
                enterButton="Tìm kiếm"
                size="large"
                onSearch={handleSearch}
                style={{ marginBottom: 16 }}
            />
            <Table
                dataSource={filteredData}
                columns={columns}
                rowKey="order_id"
                pagination={10}
            />
            <Modal
                title="Chi Tiết Đơn Hàng"
                visible={isModalVisible}
                onCancel={handleModalClose}
                footer={null}
            >
                {currentOrder && (
                    <div>
                        <h3>Danh Sách Mặt Hàng:</h3>
                        {currentOrder.items.map(item => (
                            <div key={item.name}>
                                <strong>Sách: {item.name}</strong> - Số lượng: {item.quantity} - Giá: {(item.price / 100).toFixed(2)}
                            </div>
                        ))}
                        <h4>Địa Chỉ Nhận Hàng:</h4>
                        <div style={{ fontSize: '20px' }}>{currentOrder.address.district}</div>
                        <div>{currentOrder.address.commune}</div>
                        <div>{currentOrder.address.detailed}</div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default ListOrder;
