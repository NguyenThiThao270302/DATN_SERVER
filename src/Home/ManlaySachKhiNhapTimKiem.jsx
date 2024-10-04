import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { message } from 'antd';
import styleCart from './list_book_home.module.css';
import CardProduct from './CardProduct';

const ManlaySachKhiNhapTimKiem = () => {
    const [books, setBooks] = useState([]);

    const fetchBooks = async () => {
        try {
            const namebook = localStorage.getItem('book_name');
            const response = await axios.get(`http://127.0.0.1:8080/manager/book/list/filter?name=${namebook}`);
            
            if (response.data.code === 0) {
                setBooks(response.data.body);
                console.log("Books data", response.data.body);
            } else {
                message.error('Lỗi kết nối mạng vui lòng thử lại');
            }
        } catch (error) {
            message.error('Lỗi kết nối mạng vui lòng thử lại');
        }
    };

    useEffect(() => {
        fetchBooks();
    }, []);

    return (
        <div className={styleCart['books-container']}>
            {books.length > 0 ? (
                books.map((item) => (
                    <div key={item.id} className={styleCart['book-card']}>
                        <CardProduct
                            bookId={item.id}
                            author_name={item.author_name}
                            discount_price={item.discount_price}
                            price={item.price}
                            publisher={item.publisher}
                            title={item.title}
                            file_desc_first={item.file_desc_first}
                        />
                    </div>
                ))
            ) : (
                <p>No books available</p>
            )}
        </div>
    );
};

export default ManlaySachKhiNhapTimKiem;
