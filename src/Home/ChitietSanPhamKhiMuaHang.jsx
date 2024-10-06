import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Button, Col, message, Row, Space, Spin } from 'antd';
import './home_index.module.css';
import { MinusOutlined, PlusOutlined } from '@ant-design/icons';
import SubmitBuyBook from './SubmitBuyBook';
import { addToCart } from '../user/Carts';
import styleDetail from './detail_buy.module.css';
import { TiArrowBackOutline } from 'react-icons/ti';
import BookCarousel from './BookCarousel';


//màn đì têu book
const ChitietSanPhamKhiMuaHang = ({ book_id, onEventClick }) => {

    const [book, setBook] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [items, setItems] = useState(1);
    const [isBuy, setIsBuy] = useState(false);
    const [username, setUsername] = useState(null);
    const [count, setCount] = useState(1);
    const [backGohomePage, setBackGohomePage] = useState(false);

    const cartRef = useRef(null);

    useEffect(() => {
        // Check for the username in local storage
        const storedUsername = localStorage.getItem('userData');
        if (storedUsername) {
            setUsername(storedUsername);
        }
    }, []);

    const fetchBookDetails = async () => {
        try {
            // Add a 2-second delay before loading book_id
            await new Promise((resolve) => setTimeout(resolve, 1500));

            const bookId = localStorage.getItem("book_id");
            if (!bookId) {
                setError('Không tìm thấy mã sách');
                return;
            }

            const response = await axios.get(`http://localhost:8080/manager/book/detail/page?id=${bookId}`);
            if (response.data && response.data.body) {
                setBook(response.data.body);
            } else {
                setError('Không tìm thấy dữ liệu');
            }
        } catch (error) {
            setError('Lỗi khi lấy dữ liệu');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookDetails();
    }, [book_id]); // Ensure the book_id is properly defined

    useEffect(() => {
        fetchBookDetails();
    }, [book_id]);

    useEffect(() => {
        // Check for the username in local storage
        const storedUsername = JSON.parse(localStorage.getItem('userData'));

        if (storedUsername) {
            setUsername(storedUsername);
        }
    }, []);

    if (loading) return (
        <div className="loading-container">
            <Spin size="large" tip="Đang tải..." />
        </div>
    );

    if (error) return <div>{error}</div>;
    if (!book) return <div>Không có thông tin sách.</div>;

    const handleAddToCart = async () => {
        if (!username) {
            message.error('Bạn cần đăng nhập để thêm vào giỏ hàng');
            return;
        }
        const bookId = localStorage.getItem('book_id')
        const result = await addToCart(bookId, items);

        if (result.success) {
            message.success('Sách đã được thêm vào giỏ hàng');
        } else {
            message.error(result.message || 'Có lỗi xảy ra khi thêm sách vào giỏ hàng');
        }
    };

    const handleNextSubmitBuy = () => {
        setIsBuy(true);
        initOrder();
        if (onEventClick) onEventClick();
        if (localStorage.getItem('userData') === null){
            message.error('Vui lòng đăng nhập');
        }
    }


    const initOrder = async () => {
        try {
            const existingBooksJSON = localStorage.getItem('listbook');
            let existingBooks = existingBooksJSON ? JSON.parse(existingBooksJSON) : [];
    
            const discountedPrice = book.price - book.price * (book.discount_price / 100);
    
            const updatedBook = {
                ...book,
                quantity: count,
                price: discountedPrice
            };
    
            const bookIndex = existingBooks.findIndex(b => b.id === updatedBook.id);
    
            if (bookIndex > -1) {
                existingBooks[bookIndex] = updatedBook;
            } else {
                existingBooks.push(updatedBook);
            }
    
            localStorage.setItem('listbook', JSON.stringify(existingBooks));
        } catch (error) {
            console.error('Error updating book list in local storage:', error);
        }
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN').format(price);
    };

    if (isBuy) {
        return (
            <SubmitBuyBook />
        )
    }

    if (backGohomePage) {
        window.location.reload();
    }

    return (


        <div className={styleDetail.body}>
            
            <Row>
                <Col xs={6} sm={6} md={6} lg={6} xl={6} className={styleDetail['col-container']}>
                    {/* Viền */}
                    <div>
                        <TiArrowBackOutline onClick={() => setBackGohomePage(true)} style={{ fontSize: '30px' }} />
                    </div>
                </Col>

                <Col style={{ background: 'white' }} xs={12} sm={12} md={12} lg={12} xl={12}>

                    <div style={{ display: 'flex', padding: '20px' }}>

                        <BookCarousel book={book} />

                        <div style={{ paddingLeft: '40px', flex: 1 }}>

                            <Space>
                                <div style={{
                                    color: 'black',
                                    fontWeight: 'bold',
                                    fontSize: '30px',
                                    paddingTop: '40px'
                                }}>
                                    {book.title}
                                </div>
                               
                            </Space>

                            <div style={{
                                color: 'gray',
                                fontSize: '19px',
                                paddingTop: '20px'
                            }}>
                                Tác giả:
                                <span style={{
                                    color: 'black',
                                    fontSize: '17px',
                                    fontWeight: 'bold',
                                    paddingLeft: '10px'
                                }}>
                                    {book.author_name}
                                </span>
                            </div>

                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                marginTop: '20px',
                                fontSize: '20px'
                            }}>
                                <span style={{
                                    color: 'red',
                                    fontWeight: 'bold',
                                    fontSize: '30px',

                                }}>
                                    {formatPrice(book.price - book.price * (book.discount_price / 100))}₫
                                </span>
                                <span style={{
                                    color: 'gray',
                                    marginLeft: '20px',
                                    fontSize: '20px',
                                    textDecoration: 'line-through',

                                }}>
                                    {formatPrice(book.price)}đ
                                </span>
                                {book.discount_price && (
                                    <span style={{
                                        marginLeft: '40px',
                                        fontWeight: 'bold',
                                        fontSize: '25px',
                                        color: 'red'
                                    }}>
                                        -{book.discount_price}%
                                    </span>
                                )}
                            </div>

                            <div style={{
                                marginTop: '20px',
                                fontSize: '18px',
                                display: 'flex',
                                alignItems: 'center',
                                border: '1px solid lightgray',
                                borderRadius: '10px',
                                padding: '10px',
                            }}>
                                <Space>
                                    <button
                                        style={{
                                            background: 'white',
                                            border: '1px solid gray',
                                            padding: '5px 10px',
                                            borderRadius: '5px'
                                        }}
                                        onClick={() => setCount(count - 1)}
                                        disabled={count === 1}
                                    >
                                        <MinusOutlined />
                                    </button>
                                    <button style={{
                                        backgroundColor: 'white',
                                        border: 'none',
                                        fontWeight: 'bold'
                                    }}>
                                        {count}
                                    </button>
                                    <button
                                        style={{
                                            background: 'white',
                                            border: '1px solid gray',
                                            padding: '5px 10px',
                                            borderRadius: '5px' // Button rounded corners
                                        }}
                                        onClick={() => setCount(count + 1)}
                                        disabled={count === book.quantity}
                                    >
                                        <PlusOutlined />
                                    </button>
                                </Space>
                                <span style={{ marginLeft: '20px' }}>
                                    Còn lại trong kho: {book.quantity}
                                </span>
                            </div>

                            <div style={{ marginTop: '50px' }}>
                                <Space>
                                    <Button
                                        onClick={handleNextSubmitBuy}
                                        type="primary"
                                        style={{
                                            padding: '10px 20px',
                                            fontSize: '16px',
                                            borderRadius: '10px',
                                            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                                            backgroundColor: 'white', 
                                            color: 'green',
                                            border: 'none',
                                            width: '200px', 
                                            height: '50px',
                                            border: '1px solid green',
                                            fontWeight: 'bold'

                                        }}
                                    >
                                        Mua ngay
                                    </Button>
                                    <Button
                                        onClick={handleAddToCart}
                                        type="default"
                                        style={{
                                            padding: '10px 20px',
                                            fontSize: '16px',
                                            borderRadius: '10px',
                                            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                                            color: 'white',
                                            border: '2px solid #007BFF',
                                            backgroundColor: 'green',
                                            width: '200px',
                                            height: '50px',
                                            fontWeight: 'bold'

                                        }}
                                    >
                                        Thêm vào giỏ hàng
                                    </Button>
                                </Space>

                            </div>
                        </div>
                    </div>

                    <div>
                        <div style={{
                            marginLeft: '20px',
                            marginTop: '10px',
                            color: '#28a745',
                            fontFamily: 'Arial, sans-serif',
                            fontWeight: 'bold',
                            fontSize: '24px',
                            letterSpacing: '1px',
                        }}>
                            Giới thiệu sách
                        </div>

                        <Space>

                            <div
                                style={{
                                    marginTop: '60px',
                                    padding: '15px',
                                    border: '1px solid #ddd',
                                    borderRadius: '8px',
                                    backgroundColor: '#f9f9f9',
                                    fontSize: '16px',
                                    lineHeight: '1.6',
                                    color: '#333',
                                    maxWidth: '800px',
                                    wordWrap: 'break-word', // Đảm bảo văn bản không bị cắt
                                }}
                            >
                                {book.description}
                            </div>
                            <div style={{ display: 'block', marginLeft: '20px' }}>

                                <div style={{ marginTop: '10px', fontFamily: 'Arial, sans-serif' }}>
                                    <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#2D6A4F', marginBottom: '20px', textAlign: 'center' }}>
                                        Thông tin chi tiết
                                    </h2>
                                    <div style={{ backgroundColor: '#ffffff', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', borderRadius: '8px', overflow: 'hidden' }}>
                                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '17px' }}>
                                            <tbody>
                                                {[
                                                    { label: "Tác giả", value: book.author_name },
                                                    { label: "Nhà xuất bản", value: book.publisher },
                                                    { label: "Kích thước", value: book.dimensions },
                                                    { label: "Số trang", value: book.page_count },
                                                    { label: "Ngày phát hành", value: book.published_date }
                                                ].map((item, index) => (
                                                    <tr key={index} style={{ backgroundColor: index % 2 === 0 ? '#F8F8F8' : '#FFFFFF' }}>
                                                        <td style={{ padding: '12px 15px', fontWeight: 'bold', color: '#333', borderBottom: '1px solid #E0E0E0' }}>
                                                            {item.label}
                                                        </td>
                                                        <td style={{ padding: '12px 15px', color: '#555', borderBottom: '1px solid #E0E0E0' }}>
                                                            {item.value}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>



                            </div>
                        </Space>

                    </div>

                    <div>
                        <div
                            style={{
                                marginLeft: '20px',
                                marginTop: '0px',
                                color: '#28a745',
                                fontFamily: 'Arial, sans-serif', 
                                fontWeight: 'bold',
                                fontSize: '24px', 
                                letterSpacing: '1px',
                            }}
                        >
                            Có thể bạn cũng thích
                        </div>
                     
                    </div>
                </Col>

                <Col xs={6} sm={6} md={6} lg={6} xl={6} className={styleDetail['col-container']}>
                    {/* Viền */}
                </Col>
            </Row>
        </div>


    );
};

export default ChitietSanPhamKhiMuaHang;
