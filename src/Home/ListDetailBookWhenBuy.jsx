import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Spin, Typography, message, Button, Modal, Dropdown, Menu, Input, Tooltip, Row, Drawer } from 'antd';
import Cookies from 'js-cookie';
import DetailBuy from './DetailBuy';
import Login from '../common/Login';
import { GiArmoredBoomerang } from 'react-icons/gi';
import { FcHome } from 'react-icons/fc';
import { CiLogin, CiSearch } from 'react-icons/ci';
import { AiOutlineShoppingCart } from 'react-icons/ai';
import ListCart from '../user/ListCart';
import styles from './index_header.module.css';
import { CgProfile } from 'react-icons/cg';
import FooterHeader from '../Utils/FooterHeader';
import styleCart from './list_book_home.module.css';
import CardProduct from './CardProduct';
import ListBookHome from './ListBookHome';
import ChitietSanPhamKhiMuaHang from './ChitietSanPhamKhiMuaHang';
import DetailAuthorBook from './DetailAuthorBook';
import ListAuthorBookButton from './ListAuthorBookSelect';
import ProFile from '../user/Profile';
import ListBlogCustomer from './ListBlogCustomer';


function ListDetailBookWhenBuy({ nameTypeBook }) {
    const [books, setBooks] = useState([]); // Initialize as an empty array
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedBookId, setSelectedBookId] = useState(null);  // Add state to manage selected book ID
    const [isNextBuy, setIsNextBuy] = useState(false);
    const [authors, setAuthors] = useState([]);
    const [isNext, setIsNext] = useState(false);
    const [selectedAuthor, setSelectedAuthor] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [username, setUsername] = useState(null);

    const [isDrawerVisibleCart, setIsDrawerVisibleCart] = useState(false);
    const [isNextProFile, setIsNextProFile] = useState(false);

    const [hideBookmark, setHideBookmark] = useState(false);
    const [isNextAuthorBook, setIsNextAuthorBook] = useState(false);
    const [nameAuthorBook, setNameAuthorBook] = useState(null);
    const [nameBook, setNameBook] = useState('');  // Quản lý state cho input
    const [isNextFindBook, setIsNextFindBook] = useState(false);
    const [isNextCart, setIsNextCart] = useState(false);

    const handleItemClick = () => {
        setIsNextAuthorBook(true);
    };

    const [nextBlog, setNextBlog] = useState(false);

    const handleSearch = () => {
        localStorage.setItem('book_name', nameBook);
        setIsNextFindBook(true);
    };

    const handlerNextCart = () => {
        setIsNextCart(true);
    }
    const cartRef = useRef(null);

    const openDrawerCart = () => {
        setIsDrawerVisibleCart(true);
        if (cartRef.current) {
            cartRef.current.reloadCart();
        }
    };

    const closeDrawerCart = () => {
        setIsDrawerVisibleCart(false);
    };

    const fetchBooks = async () => {
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams();
            params.append('name', localStorage.getItem('typebook'));

            const response = await axios.get(`http://127.0.0.1:8080/manager/book/list/type_book?${params.toString()}`);
            if (response.data.code === 0) {
                setBooks(response.data.body.book_detail_list || []);
            } else {
                message.error('Failed to fetch books');
            }
        } catch (err) {
            setError('Error fetching books');
            message.error('Error fetching books');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Check for the username in local storage
        const storedUsername = localStorage.getItem('userData');
        if (storedUsername) {
            setUsername(storedUsername);
        }
    }, []);

    const handleLogoutClick = () => {
        // Clear the username from local storage
        localStorage.removeItem('username');
        setUsername(null);
    };
    const handleModalClose = () => {
        setIsModalVisible(false);
    };
    const handleNextProFile = () => {
        setIsNextProFile(true);
    };
    const handleAuthorNameChange = (name) => {
        setNameAuthorBook(name);
        setIsNextAuthorBook(true); // Set to true when an author name is selected
    };


    useEffect(() => {
        fetchBooks();
    }, [nameTypeBook]);


    const handleLoginClick = () => {
        setIsModalVisible(true);
    };
    const fetchAuthors = async () => {
        setLoading(true);
        try {
            const response = await axios.get('http://127.0.0.1:8080/manager/type_book/list');
            console.log('Response data:', response.data);
            if (response.data.code === 0) {
                setAuthors(response.data.body);
            } else {
                message.error('Failed to fetch authors');
            }
        } catch (error) {
            console.error('Error fetching authors:', error);
            message.error('Error fetching authors');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAuthors();
    }, []);

    const handleMenuClick = (e) => {
        const selectedAuthor = authors.find(author => author.id === parseInt(e.key, 10));
        if (selectedAuthor) {
            setSelectedAuthor(selectedAuthor);
            setIsNext(true);
        }
    };


    if (loading) {
        return <Spin tip="Loading books..." />;
    }

    if (error) {
        return <Typography.Text type="danger">{error}</Typography.Text>;
    }


    if (isNext && selectedAuthor) {
        return <ListBookHome nameTypeBook={selectedAuthor.name} />;
    }

    const menu = (
        <Menu onClick={handleMenuClick}>
            {authors.map(author => (
                <Menu.Item key={author.id}>
                    {author.name}
                </Menu.Item>
            ))}
        </Menu>
    );
    if (books.length === 0) {

        return <div>
            <Typography.Text>Chưa có sách nào.</Typography.Text>;
        </div>
    }

    if (isNextBuy) {
        return <DetailBuy book_id={selectedBookId} />;
    }

    if (isNextProFile) {
        return <ProFile />
    }

    if (nextBlog) {
        return (
            <ListBlogCustomer />
        )
    }
    return (
        <div className={styleCart['container']}>


            <div className={styles.layoutHeader}>
                <div className={styles.layoutHeaderStart}>
                    <div className={styles.iconContainer}>
                        <GiArmoredBoomerang className={styles.icon} />
                        <span className={styles.text}>TS Shop</span>
                    </div>
                </div>
                <div className={styles.layoutHeaderCenter}>
                    <ul>
                        <li onClick={() => window.location.reload()}>
                            <FcHome />Trang chủ
                        </li>
                        <li>

                            <Dropdown overlay={menu} trigger={['click']}>
                                <Button


                                    style={{
                                        border: 'none',           // Remove border
                                        background: 'none',        // Remove background
                                        boxShadow: 'none',         // Remove any shadow
                                        padding: 0,                // Optional: adjust padding for button size
                                        color: '#1890ff',          // Text color (you can customize)
                                        cursor: 'pointer',          // Pointer for hover effect
                                        fontSize: '17px',
                                        color: 'black'
                                    }}
                                >
                                    Thư viện sách
                                </Button>
                            </Dropdown>
                        </li>
                        <li>
                            {isNextAuthorBook && nameAuthorBook ? (
                                <DetailAuthorBook authorBooName={nameAuthorBook} />
                            ) : (
                                <ListAuthorBookButton
                                    onAuthorNameChange={handleAuthorNameChange}
                                    onEventClick={handleItemClick}
                                />
                            )}
                        </li>
                        <li onClick={() => setNextBlog(true)}>Blog</li>
                        <li>Giới thiệu</li>
                        <li className={styles.searchContainer}>
                            <Input
                                placeholder='Tìm kiếm ...'
                                className={styles.searchInput}
                                value={nameBook}  // Gán giá trị từ state
                                onChange={(e) => setNameBook(e.target.value)}  // Cập nhật state khi người dùng nhập
                            />
                            <Button onClick={handleSearch} className={styles.searchButton}>
                                <CiSearch className="icon" />
                            </Button>
                        </li>
                        <li className={styles.userActions}>
                            {username ? (
                                <>
                                    <Button onClick={handleLogoutClick}>Đăng xuất</Button>
                                    <Button onClick={handleNextProFile}><CgProfile /></Button>
                                </>
                            ) : (
                                <>
                                    <Tooltip title="Đăng nhập">
                                        <CiLogin style={{ fontSize: '20px', cursor: 'pointer' }} onClick={handleLoginClick} />
                                    </Tooltip>
                                    <Modal
                                        title="Đăng nhập"
                                        visible={isModalVisible}
                                        onCancel={handleModalClose}
                                        footer={null}
                                        width={350}
                                    >
                                        <Login />
                                    </Modal>
                                </>
                            )}
                        </li>
                        <li>
                            {username && (
                                <Tooltip title="Giỏ hàng">
                                    <AiOutlineShoppingCart className={styles.cartIcon} onClick={openDrawerCart} />
                                    <Drawer
                                        title="Giỏ hàng của bạn"
                                        placement="right"
                                        onClose={closeDrawerCart}
                                        visible={isDrawerVisibleCart}
                                        width={800}
                                    >
                                        <ListCart ref={cartRef} onEventClick={handlerNextCart} />
                                    </Drawer>
                                </Tooltip>
                            )}
                        </li>
                    </ul>
                </div>
            </div>


            <div>
                <ChitietSanPhamKhiMuaHang onEventClick={() => setHideBookmark(true)} />
            </div>

            {hideBookmark ? null : (
                <div className={styleCart['col-books']}>
                    <div>
                        <div className={styleCart['books-container']}>
                            {books.slice(0, 4).map((item) => ( // Giới hạn chỉ lấy 4 item
                                <div key={item.book.id} className={styleCart['book-card']}>
                                    <CardProduct
                                        bookId={item.book.id}
                                        author_name={item.book.author_name}
                                        discount_price={item.book.discount_price}
                                        file_desc_first={item.files[0]}
                                        price={item.book.price}
                                        publisher={item.book.publisher}
                                        title={item.book.title}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}




            <div className={styleCart['footer']}>
                <FooterHeader />
            </div>
        </div >

    );
}

export default ListDetailBookWhenBuy;
