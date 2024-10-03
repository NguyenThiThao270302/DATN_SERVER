import React, { useState, useEffect, useRef } from 'react';
import './home_index.module.css';
import { FcHome } from 'react-icons/fc';
import { Button, Drawer, Dropdown, Image, Input, Menu, message, Modal, Spin, Tooltip, Typography } from 'antd';
import Login from '../common/Login';
import { CiLogin, CiSearch } from 'react-icons/ci';
import { GiArmoredBoomerang } from 'react-icons/gi';
import { AiOutlineShoppingCart } from 'react-icons/ai';
import Cookies from 'js-cookie';  // Import js-cookie
import axios from 'axios';
import { MdSell } from 'react-icons/md';
import ProFile from '../user/Profile';
import ListCart from '../user/ListCart';
import { CgProfile } from 'react-icons/cg';
import './index.module.css';
import ChatBot from '../ChatBot/ChatBot';
import ListPublicSher from './ListPublicSher';
import AuthorBook from './AuthorBook';
import SliderCard from '../Test/Pages2';
import styles from './index_header.module.css';
import FooterHeader from '../Utils/FooterHeader';
import styleLayout from './layout.module.css';  // Import CSS module
import GetListBookByNameBook from './GetListBookByNameBook';
import DetailAuthorBook from './DetailAuthorBook';
import ListAuthorBookButton from './ListAuthorBookSelect';
import ListBookLate from './ListBookLate';
import ListBookByPublicsher from './ListBookByPublicsher';
import ListDetailBookWhenBuy from './ListDetailBookWhenBuy';
import ChiTiettacGiaVaTheoSach from './ChiTiettacGiaVaTheoSach';
import ManSubmirMuaHangTuGioHang from './ManSubmirMuaHangTuGioHang';
import ListBlogCustomer from './ListBlogCustomer';
import ManLayRaListSachTheoLoai from './ManLayRaListSachTheoLoai';
const { Title, Text } = Typography;


function ListBookHome() {
    const [username, setUsername] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isNextBuy, setIsNextBuy] = useState(false);
    const [authors, setAuthors] = useState([]);
    const [isNext, setIsNext] = useState(false);
    const [selectedAuthor, setSelectedAuthor] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isNextProFile, setIsNextProFile] = useState(false);
    const [books, setBooks] = useState([]);
    const [likedBooks, setLikedBooks] = useState({});  // State to store liked status for each book
    const [isDrawerVisibleCart, setIsDrawerVisibleCart] = useState(false);
    const [nameBook, setNameBook] = useState('');  // Quản lý state cho input
    const [isNextFindBook, setIsNextFindBook] = useState(false);
    const [isNextAuthorBook, setIsNextAuthorBook] = useState(false);
    const [nameAuthorBook, setNameAuthorBook] = useState(null);
    const [isNextCart, setIsNextCart] = useState(false);
    const [nextListBookByAuthor, setNextListBookByAuthor] = useState(false);
    const [nextListBookByPublicSher, setNextListBookByPublicSher] = useState(false);
    const [nextBlog, setNextBlog] = useState(false);

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
    useEffect(() => {
        const storedUsername = localStorage.getItem('userData');
        if (storedUsername) {
            setUsername(storedUsername);
        }
    }, []);

    const handleLoginClick = () => {
        setIsModalVisible(true);
    };

    const handleLogoutClick = () => {
        localStorage.removeItem('userData');
        setUsername(null);
    };
    const handleNextProFile = () => {
        setIsNextProFile(true);
    };
    const handleModalClose = () => {
        setIsModalVisible(false);
    };
    const handlerNextCart = () => {
        setIsNextCart(true);
    }

    useEffect(() => {
        axios.get('http://localhost:8080/manager/book/sell/well')
            .then(response => {
                if (response.data && response.data.body && response.data.body.books) {
                    setBooks(response.data.body.books);
                    loadLikedBooks();
                }
            })
            .catch(error => {
                console.error('Error fetching data:', error);
            });
    }, []);

    // Load liked books from cookies
    const loadLikedBooks = () => {
        const liked = Cookies.get('likedBooks');
        if (liked) {
            setLikedBooks(JSON.parse(liked));
        }
    };


    const fetchAuthors = async () => {
        setLoading(true);
        try {
            const response = await axios.get('http://127.0.0.1:8080/manager/type_book/list');
            console.log('Response data:', response.data); // Debugging
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

    useEffect(() => {
        fetchAuthors();
    }, []);

    const handleMenuClick = (e) => {
        const selectedAuthor = authors.find(author => author.id === parseInt(e.key, 10));
        if (selectedAuthor) {
            setSelectedAuthor(selectedAuthor);
            localStorage.setItem('typebook', selectedAuthor.name);
            setIsNext(true);
        }
    };

    const menu = (
        <Menu onClick={handleMenuClick}>
            {authors.map(author => (
                <Menu.Item key={author.id}>
                    {author.name}
                </Menu.Item>
            ))}
        </Menu>
    );
    const handleSearch = () => {
        localStorage.setItem('book_name', nameBook);
        setIsNextFindBook(true);
    };

    // Handle the author name change event from ListAuthorBookButton
    const handleAuthorNameChange = (name) => {
        setNameAuthorBook(name);
        setIsNextAuthorBook(true); // Set to true when an author name is selected
    };

    // Handle item click event from ListAuthorBookButton
    const handleItemClick = () => {
        // Perform additional actions if needed
        setIsNextAuthorBook(true);
    };

    if (isNext && selectedAuthor) {
        return <ListBookHome nameTypeBook={selectedAuthor.name} />;
    }


    if (isNextBuy) {
        // return <DetailBuy book_id={selectedBookId} />;
        return <ListDetailBookWhenBuy />
    }

    if (isNextProFile) {
        return <ProFile />
    }

    if (isNextFindBook) {
        return <GetListBookByNameBook nameBook={''} />
    }

    if (isNextAuthorBook) {
        return <ChiTiettacGiaVaTheoSach />
    }

    if (nextListBookByAuthor) {
        return <ChiTiettacGiaVaTheoSach />
    }

    if (nextListBookByPublicSher) {
        return <ListBookByPublicsher />;
    }

    if (isNextCart) {
        return (
            <ManSubmirMuaHangTuGioHang />
        )
    }

    if (nextBlog) {
        return (
            <ListBlogCustomer />
        )
    }

    return (
        <div className={styleLayout.layoutHome}>

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

            <ManLayRaListSachTheoLoai />

            <div style={{marginTop:'68px'}}>
                <FooterHeader />
            </div>


        </div>
    );
}

export default ListBookHome;
