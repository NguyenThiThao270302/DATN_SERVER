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
            const response = await axios.get('http://127.0.0.1:8080/manager/order/api/list/process');
            if (response.data.code === 0) {
                const apiData = response.data.body.map(order => ({
                    ...order,
                    key: order.order_id,
                    create_time: new Date(order.create_time).toISOString(),
                    status: order.status
                }));
                setData(apiData);
                setFilteredData(apiData);
            } else {
                throw new Error('Failed to fetch data from API');
            }
        } catch (err) {
            console.error('Error fetching data:', err);
            setError('Failed to fetch data from the API.');
            setData([]);
            setFilteredData([]);
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
                    const response = await axios.patch(`http://127.0.0.1:8080/manager/order/update/admin/submit`, null, {
                        params: {
                            id: orderId,
                            status: status,
                        }
                    });
                    
                    if (response.data.code === 0) {
                        message.success('Cập nhật trạng thái thành công!');
                        setData(prevData => prevData.map(order => 
                            order.order_id === orderId ? { ...order, status: status } : order
                        ));
                        setFilteredData(prevData => prevData.map(order => 
                            order.order_id === orderId ? { ...order, status: status } : order
                        ));
                    } else {
                        message.error('Cập nhật thất bại: ' + response.data.message);
                    }
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