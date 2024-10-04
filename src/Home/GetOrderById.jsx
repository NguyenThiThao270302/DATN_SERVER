import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Form, Button, notification, message } from 'antd'; // Import Button from Ant Design
import ProductCard from '../user/ProductCard';
import { RiSecurePaymentLine } from 'react-icons/ri';

const GetOrderById = () => {
    const [listBookJson, setListBookJson] = useState([]);
    const shippingFee = 30000; // Default shipping fee
    const [api, contextHolder] = notification.useNotification();
    const [buttonLoading, setButtonLoading] = useState(false); // State for button loading
    const [addres_id,set_address_id] = useState(0)
    const openNotification = (placement, message, description) => {
        api.success({
            message,
            description,
            placement,
            duration: 3,
        });
    };


    useEffect(() => {
        const storedList = localStorage.getItem('listbook');
        if (storedList) {
            setListBookJson(JSON.parse(storedList));
        }
        const addresId  = localStorage.getItem('delivery_address')
        if(addresId) {
            set_address_id(addresId);
        }
    }, []);

    const totalAmount = listBookJson.reduce((total, item) => total + item.price * item.quantity, 0);
    const totalWithShipping = totalAmount + shippingFee;
    const userData = JSON.parse(localStorage.getItem('userData'));
    const userName = userData ? userData.user_name : '';

    const handleDeleteItem = (bookId) => {
        if (listBookJson.length > 1) {
            const updatedCart = listBookJson.filter(item => item.id !== bookId);
            setListBookJson(updatedCart);
            localStorage.setItem('listbook', JSON.stringify(updatedCart));
        } else {
            alert('Không thể xóa mục vì danh sách chỉ còn lại một mục');
            return;
        }
    };

    const handlePaymentOnline = async () => {
        setButtonLoading(true); // Set loading state to true
        try {
            const items = listBookJson.map(item => ({
                cart_id: item.book_id,
                book_id: item.id,
                book_name: item.title,
                quantity: item.quantity,
                price: item.price,
                total_amount: totalWithShipping,
                url: item.url
            }));
            console.log(items);
            const paymentData = {
                customer_name: userName,
                items: JSON.stringify(items),
                addres_id:addres_id,
            };

            const response = await axios.post('http://127.0.0.1:8080/manager/payment/create/payment', paymentData, {
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (response.data.code === 0 && response.data.body && response.data.body.checkoutUrl) {
                setListBookJson([]); // Clear the list of books
                localStorage.setItem('listbook', JSON.stringify([])); // 
                openNotification('topRight', 'Chuyển hướng đến trang thanh toán', 'Bạn sẽ được chuyển đến trang thanh toán trong giây lát.');
                setTimeout(() => {
                    window.location.href = response.data.body.checkoutUrl;
                }, 1000);
            } else {
                openNotification('topRight', 'Lỗi thanh toán', 'Có lỗi xảy ra trong quá trình tạo liên kết thanh toán. Vui lòng thử lại.');
            }
        } catch (error) {
            console.error('Có lỗi xảy ra khi thanh toán:', error);
            openNotification('topRight', 'Lỗi', 'Có lỗi xảy ra trong quá trình thanh toán. Vui lòng thử lại.');
        } finally {
            setButtonLoading(false); // Set loading state to false after completion
        }
    };

    const handlePaymentOfline = async () => {
        setButtonLoading(true); // Set loading state to true
        try {
            const items = listBookJson.map(item => ({
                cart_id: item.book_id,
                book_id: item.id,
                book_name: item.title,
                quantity: item.quantity,
                price: item.price,
                total_amount: totalWithShipping,
                url: item.url
            }));
            console.log(items);
            const paymentData = {
                customer_name: userName,
                items: JSON.stringify(items),
                addres_id:addres_id
            };

            const response = await axios.post('http://127.0.0.1:8080/manager/order/api/pend/offline', paymentData, {
                headers: {
                    'Content-Type': 'application/json',
                    'Cookie': `order_id=${Math.floor(Math.random() * 10000000)}`
                }
            });

            if (response.data.code === 0) {
                setListBookJson([]); // Clear the list of books
                localStorage.setItem('listbook', JSON.stringify([]));
                message.success("Bạn sẽ được chuyển về trang chủ trong giây lát")
                openNotification('topRight', 'Đặt hàng thành công', 'Bạn sẽ được chuyển về trang chủ trong giây lát.');
                setTimeout(() => {
                    window.location.href = '/homePage';
                }, 2000); // 500 milliseconds delay
            } else {
                openNotification('topRight', 'Lỗi đặt hàng', 'Có lỗi xảy ra trong quá trình đặt hàng. Vui lòng thử lại.');
            }
        } catch (error) {
            console.error('Có lỗi xảy ra khi thanh toán:', error);
            openNotification('topRight', 'Lỗi', 'Có lỗi xảy ra trong quá trình thanh toán. Vui lòng thử lại.');
        } finally {
            setButtonLoading(false);
        }
    };


    return (
        <div>
            {contextHolder}

            <div>
                <Form className="form-cart">
                    <Form.Item>
                        {listBookJson.map(item => (
                            <ProductCard
                                key={item.id}
                                imageUrl={item.files[0]}
                                title={item.title}
                                price={item.price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                                quantity={item.quantity}
                                sell="15"
                                onDelete={() => handleDeleteItem(item.id)}
                            />
                        ))}
                    </Form.Item>
                    <Form.Item>
                        <a href="" onClick={()=>{window.location.reload()}}>Thêm sản phẩm</a
                        >
                    </Form.Item>
                    <Form.Item>
                        <div className="form-item-total">
                            <div
                                style={{
                                    backgroundColor: 'white',
                                    height: '50px',
                                    fontSize: '20px',
                                    padding: '10px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    borderRadius: '8px',
                                    marginBottom: '8px',
                                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                                }}
                                className="total-product"
                            >
                                Tổng tiền sản phẩm: {totalAmount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                            </div>
                            <div className="total-shipping">
                                Phí vận chuyển: {shippingFee.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                            </div>
                            <div className="total-payment">
                                Tổng tiền thanh toán: {totalWithShipping.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                            </div>
                        </div>
                    </Form.Item>

                    <Form.Item className="form-item-button">
                        <Button
                            onClick={handlePaymentOnline}
                            type="primary"
                            className="form-button"
                            loading={buttonLoading}
                        >
                            Mua ngay <RiSecurePaymentLine />
                        </Button>
                    </Form.Item>
                    <Form.Item>
                        <Button
                            type="default"
                            onClick={handlePaymentOfline}
                            className="form-button"
                        >
                            Đặt hàng
                        </Button>
                    </Form.Item>
                </Form>
            </div>

        </div>
    );
};

export default GetOrderById;
