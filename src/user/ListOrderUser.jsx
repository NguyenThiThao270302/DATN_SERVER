import React, { useState, useEffect } from 'react';
import { Table, Typography, Spin, Alert, Input, Button, message, Modal, Select, Descriptions } from 'antd';
import axios from 'axios';

const { Title } = Typography;
const { Search } = Input;
const { Option } = Select;

const ListOrderUser = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  // State for filters
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedPaymentType, setSelectedPaymentType] = useState('');

  useEffect(() => {
    const userData = localStorage.getItem('userData');
    let username = '';

    try {
      const parsedUserData = JSON.parse(userData);
      username = parsedUserData?.user_name || '';
      if (!username) throw new Error('Username is missing');
    } catch (err) {
      setError('Error retrieving user data');
      setLoading(false);
      return;
    }

    // Fetching order data
    const fetchData = async () => {
      try {
        const response = await axios.get(`http://127.0.0.1:8080/manager/order/api/getlist/user?name=${username}`);
        setData(response.data.body);
        setFilteredData(response.data.body);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Function to handle search and filtering
  const handleSearch = (value) => {
    setSearchText(value);
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

      // Check for selected filters
      const statusMatches = selectedStatus ? order.status === parseInt(selectedStatus) : true;
      const paymentMatches = selectedPaymentType ? order.payment_type === parseInt(selectedPaymentType) : true;

      return (orderIdMatches || addressMatches || amountMatches) && statusMatches && paymentMatches;
    });

    setFilteredData(filtered);
  };

  const confirmCancel = (id) => {
    Modal.confirm({
      title: 'Xác Nhận Hủy Đơn Hàng',
      content: 'Bạn có chắc chắn muốn hủy đơn hàng này?',
      onOk: () => handleCancel(id),
    });
  };

  const handleCancel = async (id) => {
    try {
      const response = await axios.patch(`http://127.0.0.1:8080/manager/order/api/update/calcel?id=${id}`);
      if (response.data.code === 0) {
        message.success('Đơn hàng đã được hủy thành công');
        updateOrderStatus(id, 11)
        handleModalClose();
      } else {
        message.error('Không thể hủy đơn hàng');
      }
    } catch (err) {
      message.error(`Lỗi: ${err.message}`);
    }
  };

  const updateOrderStatus = (id, status) => {
    setData(prevData => prevData.map(order => (order.order_id === id ? { ...order, status } : order)));
    setFilteredData(prevData => prevData.map(order => (order.order_id === id ? { ...order, status } : order)));
  };

  const showOrderDetails = (order) => {
    setSelectedOrder(order);
    setIsModalVisible(true);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    setSelectedOrder(null);
  };

  const statusOptions = [
    { value: '', label: 'Tất cả trạng thái' },
    { value: '21', label: 'Đang Chờ Thanh Toán Online' },
    { value: '19', label: 'Đang Chờ Gửi Hàng' },
    { value: '23', label: 'Đang Giao' },
    { value: '11', label: 'Đơn Hàng Đã Hủy' },
    { value: '9', label: 'Đã Giao Hàng và Thanh Toán' },
  ];

  const paymentTypeOptions = [
    { value: '', label: 'Tất cả loại thanh toán' },
    { value: '27', label: 'Thanh Toán Online' },
    { value: '25', label: 'Thanh Toán Khi Nhận Hàng' },
  ];

  const columns = [
    {
      title: 'Mã Đơn Hàng',
      dataIndex: 'order_id',
      key: 'order_id',
    },
    {
      title: 'Thời Gian Tạo',
      dataIndex: 'create_time',
      key: 'create_time',
      render: text => new Date(text).toLocaleString(),
    },
    {
      title: 'Số Tiền',
      dataIndex: 'amount',
      key: 'amount',
      render: text => `${(text / 100).toFixed(2)}`,
    },
    {
      title: 'Trạng Thái',
      dataIndex: 'status',
      key: 'status',
      render: status => {
        const statusLabels = {
          23: 'Đơn hàng đã giao và hoàn tất',
          21: 'Đang giao hàng',
          19: 'Đang chờ vận chuyển',
          17: 'Đang chuẩn bị đơn hàng',
          11: 'Đang chờ xác nhận',
        };
        return statusLabels[status] || 'Trạng Thái Không Xác Định';
      },
    },
    {
      title: 'Loại Thanh Toán',
      dataIndex: 'payment_type',
      key: 'payment_type',
      render: paymentType => {
        const paymentLabels = {
          25: 'Thanh Toán Online',
          27: 'Thanh Toán Khi Nhận Hàng',
        };
        return paymentLabels[paymentType] || 'Loại Thanh Toán Không Xác Định';
      },
    },
    {
      title: ' ',
      key: 'action',
      render: (text, record) => {
        const { status, order_id } = record;
        const canCancel = [19, 23].includes(status);

        return (
          <>
            {canCancel && (
              <Button
                type="primary"
                danger
                onClick={() => confirmCancel(order_id)}
              >
                Hủy Đơn Hàng
              </Button>
            )}
            <Button
              type="link"
              onClick={() => showOrderDetails(record)}
            >
              Xem Chi Tiết
            </Button>
          </>
        );
      },
    },
  ];

  if (loading) return <Spin tip="Đang Tải..." />;
  if (error) return <Alert message="Lỗi" description={error} type="error" />;

  const handleReset = () => {
    setSelectedStatus('');
    setSelectedPaymentType('');
    setFilteredData(data); // Reset to original data
    setSearchText(''); // Clear search text
  };

  return (
    <div>
      <Title level={2}>Danh Sách Đơn Hàng</Title>
      <Search
        placeholder="Tìm kiếm theo mã đơn hàng, địa chỉ, hoặc giá tiền"
        allowClear
        enterButton="Tìm kiếm"
        size="large"
        onSearch={handleSearch}
        value={searchText}
        onChange={(e) => handleSearch(e.target.value)}
      />
      <Select
        placeholder="Chọn trạng thái"
        style={{ width: 200, margin: '10px' }}
        value={selectedStatus}
        onChange={setSelectedStatus}
      >
        {statusOptions.map(option => (
          <Option key={option.value} value={option.value}>{option.label}</Option>
        ))}
      </Select>
      <Select
        placeholder="Chọn loại thanh toán"
        style={{ width: 200, margin: '10px' }}
        value={selectedPaymentType}
        onChange={setSelectedPaymentType}
      >
        {paymentTypeOptions.map(option => (
          <Option key={option.value} value={option.value}>{option.label}</Option>
        ))}
      </Select>
      <Button onClick={handleReset} type="default">Đặt lại</Button>
      <Table
        columns={columns}
        dataSource={filteredData}
        rowKey="order_id"
      />
      {selectedOrder && (
       <Modal
       title="Chi Tiết Đơn Hàng"
       visible={isModalVisible}
       onCancel={handleModalClose}
       footer={null}
       width={800} // Adjust this value as needed
     >
       <Descriptions bordered column={1}> {/* Use column prop to control how many columns to display */}
         <Descriptions.Item label="Mã Đơn Hàng">{selectedOrder.order_id}</Descriptions.Item>
         <Descriptions.Item label="Địa Chỉ">{`${selectedOrder.address.district}, ${selectedOrder.address.commune}, ${selectedOrder.address.detailed}`}</Descriptions.Item>
         <Descriptions.Item label="Thời Gian mua">{new Date(selectedOrder.create_time).toLocaleString()}</Descriptions.Item>
         <Descriptions.Item label="Số Tiền">{(selectedOrder.amount / 100).toFixed(2)}</Descriptions.Item>
       </Descriptions>
     </Modal>
     
      )}
    </div>
  );
};

export default ListOrderUser;
