import React, { useEffect, useState } from 'react';
import { Table, Card, Spin, Alert, Button, Popconfirm } from 'antd';
import axios from 'axios';

const Favorite = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [likedBooks, setLikedBooks] = useState({});

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('userData'));

    // Fetch the data from the API
    axios.get(`http://127.0.0.1:8080/manager/favorite/list?id=${userData.id}`)
      .then(response => {
        if (response.data.code === 0) {
          setData(response.data.body.books);
        } else {
          setError('Lấy dữ liệu thất bại');
        }
        setLoading(false);
      })
      .catch(err => {
        setError('Có lỗi xảy ra');
        setLoading(false);
      });
  }, []);

  const unToggleLike = (bookId) => {
    const userData = JSON.parse(localStorage.getItem('userData'));
    const userId = userData?.id;

    if (userId) {
      fetch(`http://127.0.0.1:8080/manager/favorite/delete?id=${bookId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      })
      .then(response => response.json())
      .then(data => {
        if (data.code === 0) {
          // Update local storage and state
          let favoriteBooks = JSON.parse(localStorage.getItem('list_book_favorite')) || [];
          favoriteBooks = favoriteBooks.filter(id => id !== bookId);
          localStorage.setItem('list_book_favorite', JSON.stringify(favoriteBooks));
          setData(prevData => prevData.filter(book => book.id !== bookId));
          setLikedBooks(prevState => ({
            ...prevState,
            [bookId]: false
          }));
        } else {
          console.error("Failed to remove book from favorites:", data.message);
        }
      })
      .catch(error => {
        console.error("Error:", error);
      });
    } else {
      console.log("User not logged in");
    }
  };

  const columns = [
    {
      title: 'Tên sách',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Tên tác giả',
      dataIndex: 'author_name',
      key: 'author_name',
    },
    {
      title: 'Nhà xuất bản',
      dataIndex: 'publisher',
      key: 'publisher',
    },
    {
      title: 'Ngày xuất bản',
      dataIndex: 'published_date',
      key: 'published_date',
    },
    {
      title: 'Giá',
      dataIndex: 'price',
      key: 'price',
    },
    {
      title: 'Giá giảm',
      dataIndex: 'discount_price',
      key: 'discount_price',
    },
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
      key: 'quantity',
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Popconfirm
          title="Bạn có chắc chắn muốn xóa sách này không?"
          onConfirm={() => unToggleLike(record.id)}
          okText="Có"
          cancelText="Không"
        >
          <Button danger>Xóa</Button>
        </Popconfirm>
      ),
    },
  ];

  // Render the component
  return (
    <div style={{ padding: '20px' }}>
      {loading ? (
        <Spin size="large" />
      ) : error ? (
        <Alert message={error} type="error" showIcon />
      ) : (
        <Card title="Sách yêu thích">
          <Table
            dataSource={data}
            columns={columns}
            rowKey="id"
            pagination={{ pageSize: 10 }}
          />
        </Card>
      )}
    </div>
  );
};

export default Favorite;
