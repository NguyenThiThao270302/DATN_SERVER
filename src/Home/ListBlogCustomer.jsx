import React, { useState, useEffect } from 'react';
import { FcHome } from 'react-icons/fc';
import { Button, Dropdown, Image, Menu, message, Spin } from 'antd';
import { GiArmoredBoomerang } from 'react-icons/gi';
import axios from 'axios';
import ListBookHome from './ListBookHome';
// import styles from './index_header.module.css';
import FooterHeader from '../Utils/FooterHeader';
import DetailAuthorBook from './DetailAuthorBook';
import ListAuthorBookButton from './ListAuthorBookSelect';
import styles from './blog.module.css';
import ListBlogUtils from '../Utils/ListBlogUtils';

function ListBlogCustomer() {
    const [authors, setAuthors] = useState([]);
    const [isNext, setIsNext] = useState(false);
    const [selectedAuthor, setSelectedAuthor] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isNextAuthorBook, setIsNextAuthorBook] = useState(false);
    const [nameAuthorBook, setNameAuthorBook] = useState(null);


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

    const handleMenuClick = (e) => {
        const selectedAuthor = authors.find(author => author.id === parseInt(e.key, 10));
        if (selectedAuthor) {
            setSelectedAuthor(selectedAuthor);
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
 

    if (isNextAuthorBook) {
        return <DetailAuthorBook authorBooName={nameAuthorBook} />
    }


    return (
        <div>

            <div  className={styles.layoutHeader}>
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
                            {loading ? (
                                <Spin tip="Loading authors..." />
                            ) : (
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
                                        }}
                                    >
                                        Thư viện sách
                                    </Button>
                                </Dropdown>
                            )}
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
                        <li>Blog</li>
                        <li>Giới thiệu</li>


                    </ul>
                </div>
            </div>


            <div className={styles.layoutContentImage}>
                <Image
                    width="100%"
                    height={300}
                    src="https://th.bing.com/th/id/OIG2.gBo1U.SuIE.iiAHhpJnI?w=1024&h=1024&rs=1&pid=ImgDetMain"
                    alt="Decorative"
                />
            </div>
            <div>
                <ListBlogUtils/>
            </div>

            <div className="layout-footer">            
                <FooterHeader />
            </div>

        </div>
    );
}

export default ListBlogCustomer;
