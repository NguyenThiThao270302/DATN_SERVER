import React, { useState, useEffect } from 'react';
import { Table, Input, Button, message, Popconfirm, Space, Modal, Form } from 'antd';
import axios from 'axios';

function TypeBook() {
    const [typeBooks, setTypeBooks] = useState([]);
    const [filteredBooks, setFilteredBooks] = useState([]);
    const [newTypeName, setNewTypeName] = useState('');
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingBook, setEditingBook] = useState(null);
    const [editForm] = Form.useForm();

    const fetchTypeBooks = async () => {
        setLoading(true);
        try {
            const response = await axios.get('http://127.0.0.1:8080/manager/type_book/list');
            if (response.data.code === 0) {
                setTypeBooks(response.data.body);
                setFilteredBooks(response.data.body);
            } else {
                message.error('Không thể lấy danh sách loại sách.');
            }
        } catch (error) {
            console.error('Lỗi khi lấy danh sách loại sách:', error);
            message.error('Lỗi kết nối.');
        } finally {
            setLoading(false);
        }
    };

    const addTypeBook = async () => {
        if (!newTypeName.trim()) {
            message.error('Vui lòng nhập tên loại sách.');
            return;
        }

        try {
            const formData = new FormData();
            formData.append('name', newTypeName);

            const response = await axios.post('http://127.0.0.1:8080/manager/type_book/add', formData);
            if (response.data.code === 0) {
                message.success('Thêm loại sách thành công!');
                setNewTypeName('');
                fetchTypeBooks();
            } else if (response.data.code === 2) {
                message.error('Tên loại sách đã tồn tại.');
            } else {
                message.error('Không thể thêm loại sách.');
            }
        } catch (error) {
            console.error('Lỗi khi thêm loại sách:', error);
            message.error('Lỗi kết nối.');
        }
    };

    const handleDelete = async (record) => {
        try {
            const response = await axios.delete(`http://127.0.0.1:8080/manager/type_book/delete?id=${record.id}`);
            if (response.data.code === 0) {
                message.success('Xóa loại sách thành công!');
                fetchTypeBooks();
            } else {
                message.error('Không thể xóa loại sách.');
            }
        } catch (error) {
            console.error('Lỗi khi xóa loại sách:', error);
            message.error('Lỗi kết nối.');
        }
    };

    const handleEdit = (record) => {
        setEditingBook(record);
        setIsModalVisible(true);
        editForm.setFieldsValue({ name: record.name });
    };

    const handleUpdate = async () => {
        try {
            const values = await editForm.validateFields();
            const formData = new FormData();
            formData.append('id', editingBook.id);
            formData.append('name', values.name);

            const response = await axios.patch('http://127.0.0.1:8080/manager/type_book/update', formData);
            if (response.data.code === 0) {
                message.success('Cập nhật loại sách thành công!');
                fetchTypeBooks();
                setIsModalVisible(false);
            } else {
                message.error('Không thể cập nhật loại sách.');
            }
        } catch (error) {
            console.error('Lỗi khi cập nhật loại sách:', error);
            message.error('Lỗi kết nối.');
        }
    };

    const handleSearch = (value) => {
        setSearchText(value);
        const filtered = typeBooks.filter(book =>
            book.name.toLowerCase().includes(value.toLowerCase())
        );
        setFilteredBooks(filtered);
    };

    useEffect(() => {
        fetchTypeBooks();
    }, []);

    const columns = [
        {
            title: 'STT',
            key: 'index',
            render: (text, record, index) => index + 1,
        },
        {
            title: 'Tên loại sách',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Hành động',
            key: 'action',
            render: (text, record) => (
                <Space size="middle">
                    <Button type="primary" onClick={() => handleEdit(record)}>
                        Sửa
                    </Button>
                    <Popconfirm
                        title="Bạn có chắc chắn muốn xóa loại sách này không?"
                        onConfirm={() => handleDelete(record)}
                        okText="Có"
                        cancelText="Không"
                    >
                        <Button type='dashed'>Xóa</Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div>
            <h1>Loại Sách</h1>
            <Space direction="vertical" style={{ width: '100%', marginBottom: 16 }}>
                <Space>
                    <Input
                        placeholder="Nhập tên loại sách mới"
                        value={newTypeName}
                        onChange={(e) => setNewTypeName(e.target.value)}
                        style={{ width: 300 }}
                    />
                    <Button style={{ height: '39px' }} type="primary" onClick={addTypeBook}>
                        Thêm
                    </Button>
                </Space>
                <Space style={{ marginTop: 16 }}>
                    <Input.Search
                        placeholder="Tìm kiếm theo tên loại sách"
                        allowClear
                        enterButton="Tìm kiếm"
                        size="large"
                        onSearch={handleSearch}
                        onChange={(e) => handleSearch(e.target.value)}
                        style={{ marginBottom: 16 }}
                    />
                </Space>
            </Space>
            <Table
                columns={columns}
                dataSource={filteredBooks}
                rowKey="id"
                loading={loading}
                pagination={{ pageSize: 10 }}
            />
            <Modal
                title="Cập nhật loại sách"
                visible={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                onOk={handleUpdate}
            >
                <Form form={editForm} layout="vertical">
                    <Form.Item
                        label="Tên loại sách"
                        name="name"
                        rules={[{ required: true, message: 'Vui lòng nhập tên loại sách' }]}
                    >
                        <Input placeholder="Nhập tên loại sách" />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}

export default TypeBook;