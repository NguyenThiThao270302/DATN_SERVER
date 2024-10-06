import React, { useEffect, useState } from 'react';
import { Form, Button, notification, Spin } from 'antd';
import axios from 'axios'; // Make sure axios is installed
import ProductCard from './ProductCard';
import { RiSecurePaymentLine } from 'react-icons/ri';
import { TiArrowBack } from 'react-icons/ti';

function FormBuyCart() {
    const [listCartJson, setListCartJson] = useState([]);
    const [loading, setLoading] = useState(true);
    const [api, contextHolder] = notification.useNotification();
    const [nextHomePage, setNextHomePage] = useState(false);
    const [buttonLoading, setButtonLoading] = useState(false); // New state for button loading
    const shippingFee = 30000; // Default shipping fee
    const [addres_id, set_address_id] = useState(0)

    const [goback, setGoBack] = useState(false);

    const openNotification = (placement, message, description) => {
        api.success({
            message,
            description,
            placement,
            duration: 3,
        });
    };

    const userData = JSON.parse(localStorage.getItem('userData'));
    const userName = userData ? userData.user_name : '';

    const handleDeleteItem = (cartId) => {
        if (listCartJson.length > 1) { // Ensure at least one item remains
            const updatedCart = listCartJson.filter(item => item.cart_id !== cartId);
            setListCartJson(updatedCart);
            localStorage.setItem('list_cart', JSON.stringify(updatedCart)); // Update localStorage after deletion
        } else {
            notification.error({
                message: 'Không thể xóa',
                description: 'Phải có ít nhất 1 sản phẩm trong giỏ hàng',
                placement: 'topRight',
            });
        }
    };

    useEffect(() => {
        const addresId = localStorage.getItem('delivery_address')
        if (addresId) {
            set_address_id(addresId);
        }
        const timer = setTimeout(() => {
            const listCart = localStorage.getItem('list_cart');
            const parsedData = JSON.parse(listCart || '[]');
            setListCartJson(parsedData);
            setLoading(false);
        }, 2000);

        return () => clearTimeout(timer);
    }, []);

    const totalAmount = listCartJson.reduce((total, item) => total + item.total_amount, 0);
    const totalWithShipping = totalAmount + shippingFee;


    const handlePaymentOnline = async () => {
        setButtonLoading(true);
        try {
            const items = listCartJson.map(item => ({
                cart_id: item.cart_id,
                book_id: item.book_id,
                book_name: item.book_name,
                quantity: item.quantity,
                price: item.price,
                total_amount: totalWithShipping,
                url: item.url
            }));

            const paymentData = {
                customer_name: userName,
                items: JSON.stringify(items),
                addres_id: addres_id
            };

            const response = await axios.post('http://127.0.0.1:8080/manager/payment/create/payment', paymentData, {
                headers: {
                    'Content-Type': 'application/json',
                    'Cookie': `order_id=${Math.floor(Math.random() * 10000000)}` // Generate a random order_id
                }
            });

            if (response.data.code === 0 && response.data.body && response.data.body.checkoutUrl) {
                openNotification('topRight', 'Chuyển hướng đến trang thanh toán', 'Bạn sẽ được chuyển đến trang thanh toán trong giây lát.');
                setTimeout(() => {
                    window.location.href = response.data.body.checkoutUrl;
                }, 700);
            } else {
                openNotification('topRight', 'Lỗi thanh toán', 'Có lỗi xảy ra trong quá trình tạo liên kết thanh toán. Vui lòng thử lại.');
            }
        } catch (error) {
            console.error('Có lỗi xảy ra khi thanh toán:', error);
            openNotification('topRight', 'Lỗi', 'Có lỗi xảy ra trong quá trình thanh toán. Vui lòng thử lại.');
        } finally {
            setTimeout(() => setButtonLoading(false), 3000);
        }
    };

    const handlePaymentOfline = async () => {
        setButtonLoading(true);
        try {
            const items = listCartJson.map(item => ({
                cart_id: item.cart_id,
                book_id: item.book_id,
                book_name: item.book_name,
                quantity: item.quantity,
                price: item.price,
                total_amount: totalWithShipping,
                url: item.url
            }));

            const paymentData = {
                customer_name: userName,
                items: JSON.stringify(items),
                addres_id: addres_id
            };

            const response = await axios.post('http://127.0.0.1:8080/manager/order/api/pend/offline', paymentData, {
                headers: {
                    'Content-Type': 'application/json',
                    'Cookie': `order_id=${Math.floor(Math.random() * 10000000)}` // Generate a random order_id
                }
            });

            if (response.data.code === 0) {
                openNotification('topRight', 'Chuyển hướng đến trang thanh toán', 'Bạn sẽ được chuyển đến trang thanh toán trong giây lát.');
                // Redirect to the payment page
                setTimeout(() => {
                    setNextHomePage(true);
                }, 1000); // Redirect after 1 second
            } else {
                openNotification('topRight', 'Lỗi thanh toán', 'Có lỗi xảy ra trong quá trình tạo liên kết thanh toán. Vui lòng thử lại.');
            }
        } catch (error) {
            console.error('Có lỗi xảy ra khi thanh toán:', error);
            openNotification('topRight', 'Lỗi', 'Có lỗi xảy ra trong quá trình thanh toán. Vui lòng thử lại.');
        } finally {
            setTimeout(() => setButtonLoading(false), 3000);
        }
    };


    if (nextHomePage) {
        setTimeout(() => {
            window.location.href = '/'; // Replace '/' with your actual homepage route if necessary
        }, 1000); // Redirect after 1 second
    }
    

    if (nextHomePage) {
        window.location.reload();
    }
    if(goback){
        window.location.reload();
    }

    return (
        <Spin spinning={loading} tip="Đang tải..." size="large">
            <div>
                {contextHolder}
                <Form className="form-cart">
                    <Form.Item>
                        {listCartJson.map(item => (
                            <ProductCard
                                key={item.cart_id}
                                imageUrl={item.url}
                                title={item.book_name}
                                price={item.price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                                quantity={item.quantity}
                                sell="15"
                                onDelete={() => handleDeleteItem(item.cart_id)}
                            />
                        ))}
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
                        <Button type="primary" onClick={handlePaymentOnline} className="form-button">
                            Mua ngay  <RiSecurePaymentLine />
                        </Button>
                    </Form.Item>
                    <Form.Item>
                        <Button
                            type="default"
                            onClick={handlePaymentOfline}
                            className="form-button"
                            loading={buttonLoading} // Show spinner on button
                        >
                            Đặt hàng
                        </Button>
                    </Form.Item>
                </Form>
            </div>
        </Spin>
    );
}

export default FormBuyCart;
