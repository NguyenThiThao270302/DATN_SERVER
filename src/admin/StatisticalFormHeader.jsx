import React, { useEffect, useState } from 'react';
import style from './index_statistical.module.css';
import axios from 'axios';
import { DatePicker, Space } from 'antd';
import dayjs from 'dayjs';

function StatisticalFormHeader() {
    const [orderDetails, setOrderDetails] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [selectedDate, setSelectedDate] = useState(dayjs());
    const [countNewUser, setCountNewUser] = useState(0);

    const handleGetInforOrder = async () => {
        try {
            const response = await axios.get('http://127.0.0.1:8080/manager/order/api/listorder/admin/header');

            if (response.data.code === 0) {
                setOrderDetails(response.data.body.order_details_admin);
                setFilteredOrders(response.data.body.order_details_admin);
                setCountNewUser(response.data.body.user.length); // Count new users based on the user array
            }
        } catch (error) {
            console.error('Error fetching order information:', error);
        }
    };

    useEffect(() => {
        handleGetInforOrder();
    }, []);

    useEffect(() => {
        const filtered = orderDetails.filter(order => 
            dayjs(order.time_user_buy, 'DD/MM/YYYY').isSame(selectedDate, 'day')
        );
        setFilteredOrders(filtered);
    }, [selectedDate, orderDetails]);

    const handleDateChange = (date) => {
        if (date) {
            setSelectedDate(date);
        }
    };

    const totalProducts = filteredOrders.reduce((sum, order) => 
        sum + order.quantity, 0 // Adjusted to sum quantity directly from orders
    , 0);

    return (
        <div>
            <div>
                <Space>
                    <DatePicker onChange={handleDateChange} value={selectedDate} />
                </Space>
            </div>
            <div className={style.container}>
                <div className={style.row}>
                    <div className={style.col}>
                        <div>Sản phẩm</div>
                        <div style={{ color: '#FFD700' }} className={style.col_value_product}>{totalProducts}</div>
                    </div>
                    <div className={style.col}>
                        <div>Số đơn hàng mới trong ngày</div>
                        <div style={{ color: '#1E90FF' }} className={style.col_value_count_order}>
                            {filteredOrders.length}
                        </div>
                    </div>
                    <div className={style.col}>
                        <div>Số khách hàng mới trong tháng</div>
                        <div style={{ color: '#FFA500' }} className={style.col_value_count_new_customer}>{countNewUser}</div>
                    </div>
                    <div className={style.col}>
                        <div>Doanh thu hôm nay</div>
                        <div style={{ color: '#20B2AA' }} className={style.col_value_amount}>
                            {filteredOrders.reduce((sum, order) => sum + order.amount, 0)}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default StatisticalFormHeader;
