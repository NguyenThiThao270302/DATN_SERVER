import React, { useState, useEffect, useRef } from 'react';
import './home_index.module.css';
import { FcHome } from 'react-icons/fc';
import { Button, Drawer, Dropdown, Input, Menu, message, Modal, Tooltip, Typography } from 'antd';
import Login from '../common/Login';
import { CiLogin, CiSearch } from 'react-icons/ci';
import { GiArmoredBoomerang } from 'react-icons/gi';
import { AiOutlineShoppingCart } from 'react-icons/ai';
import Cookies from 'js-cookie';  // Import js-cookie
import axios from 'axios';
import ListBookHome from './ListBookHome';
import ProFile from '../user/Profile';
import ListCart from '../user/ListCart';
import { CgProfile } from 'react-icons/cg';
import './index.module.css';

import styles from './index_header.module.css';
import FooterHeader from '../Utils/FooterHeader';
import styleLayout from './layout.module.css';  // Import CSS module
import DetailAuthorBook from './DetailAuthorBook';
import ListAuthorBookButton from './ListAuthorBookSelect';
import ListBookByPublicsher from './ListBookByPublicsher';
import ListDetailBookWhenBuy from './ListDetailBookWhenBuy';
import ChiTiettacGiaVaTheoSach from './ChiTiettacGiaVaTheoSach';
import ManSubmirMuaHangTuGioHang from './ManSubmirMuaHangTuGioHang';
import ListBlogCustomer from './ListBlogCustomer';
import styleCart from './list_book_home.module.css';
import CardProduct from './CardProduct';
import GioiThieu from './GioiThieu';
import ManlaySachKhiNhapTimKiem from './ManlaySachKhiNhapTimKiem';
const { Title } = Typography;


function GetListBookByNameBook() {
    const [username, setUsername] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isNextBuy, setIsNextBuy] = useState(false);
    const [authors, setAuthors] = useState([]);
    const [isNext, setIsNext] = useState(false);
    const [selectedAuthor, setSelectedAuthor] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isNextProFile, setIsNextProFile] = useState(false);
    const [books, setBooks] = useState([]);
    const [isDrawerVisibleCart, setIsDrawerVisibleCart] = useState(false);
    const [nameBook, setNameBook] = useState('');  // Quản lý state cho input
    const [isNextFindBook, setIsNextFindBook] = useState(false);
    const [isNextAuthorBook, setIsNextAuthorBook] = useState(false);
    const [nameAuthorBook, setNameAuthorBook] = useState(null);
    const [isNextCart, setIsNextCart] = useState(false);
    const [nextListBookByAuthor, setNextListBookByAuthor] = useState(false);
    const [nextListBookByPublicSher, setNextListBookByPublicSher] = useState(false);
    const [nextBlog, setNextBlog] = useState(false);
    const [gioiThieu, setGioiThieu] = useState(false);

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

    const handleAuthorNameChange = (name) => {
        setIsNextAuthorBook(true);
    };

    const handleItemClick = () => {
        setIsNextAuthorBook(true);
    };

    if (isNext && selectedAuthor) {
        return <ListBookHome nameTypeBook={selectedAuthor.name} />;
    }


    if (isNextBuy) {
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

    if (gioiThieu) {
        return (
            <GioiThieu />
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
                                        border: 'none',
                                        background: 'none',
                                        boxShadow: 'none',
                                        padding: 0,
                                        color: '#1890ff',
                                        cursor: 'pointer',
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
                        <li onClick={() => setGioiThieu(true)}>Giới thiệu</li>
                        <li className={styles.searchContainer}>
                            <Input
                                placeholder='Tìm kiếm ...'
                                className={styles.searchInput}
                                value={nameBook}
                                onChange={(e) => setNameBook(e.target.value)}
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

            <div style={{marginTop:'50px'}}>
                <ManlaySachKhiNhapTimKiem />
            </div>

            <div style={{ marginTop: '19px' }} className="layout-footer">
                <FooterHeader />
            </div>

        </div>
    );
}

export default GetListBookByNameBook;
