import React, { useState, useEffect } from 'react';
import { Table, Input, Button, message, Form, DatePicker, Upload, Avatar, Space, Popconfirm, Modal } from 'antd';
import axios from 'axios';
import moment from 'moment';
import UpdateAuthorModal from './UpdateAuthorModal';  // Import modal
import { FaCloudUploadAlt } from 'react-icons/fa';
const { Search } = Input;

function AuthorBook() {
    const [authors, setAuthors] = useState([]);  // List of authors
    const [filteredAuthors, setFilteredAuthors] = useState([]);  // Filtered list of authors
    const [loading, setLoading] = useState(false);  // Loading state
    const [searchName, setSearchName] = useState('');  // Search by name
    const [birthDate, setBirthDate] = useState(null);  // Birth date filter
    const [selectedAuthor, setSelectedAuthor] = useState(null);  // Selected author for update
    const [isUpdateModalVisible, setUpdateModalVisible] = useState(false);  // Modal visibility
    const [isBiographyModalVisible, setBiographyModalVisible] = useState(false);  // Modal for biography
    const [selectedBiography, setSelectedBiography] = useState('');  // Selected biography for modal
    const [imageFile, setImageFile] = useState(null);  // Avatar image upload state

    const fetchAuthors = async () => {
        setLoading(true);
        try {
            const response = await axios.get('http://127.0.0.1:8080/manager/author_book/list');
            if (response.data.code === 0) {
                setAuthors(response.data.body);
                setFilteredAuthors(response.data.body);
            }
        } catch (error) {
            console.error('Error fetching authors:', error);
            message.error('Error fetching authors');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        const value = e ? e.target.value : searchName; // Use event target value if available, otherwise use the current state
    
        setSearchName(value);
    
        const filtered = authors.filter(author =>
            author.name.toLowerCase().includes(value.toLowerCase())
        );
        setFilteredAuthors(filtered);
    };
    
    useEffect(() => {
        fetchAuthors();
    }, []);

    useEffect(() => {
        handleSearch(); // Apply search filter whenever searchName changes
    }, [searchName]);

    // Function to add a new author
    const addAuthor = async (values) => {
        try {
            const formData = new FormData();
            formData.append('name', values.name);
            formData.append('biography', values.biography);
            formData.append('nationality', values.nationality);

            if (birthDate) {
                formData.append('birth_date', birthDate.format('YYYY-MM-DD'));
            }

            formData.append('file', imageFile);  // Ensure the correct file is attached

            const response = await axios.post('http://127.0.0.1:8080/manager/author_book/add', formData);
            if (response.data.code === 0) {
                message.success('Author added successfully!');
                fetchAuthors(); // Refresh the list
            } else if (response.data.code === 2) {
                message.error('Author name already exists.');
            }
        } catch (error) {
            console.error('Error adding author:', error);
            message.error('Unable to add author.');
        }
    };

    const handleDeleteBook = async (id) => {
        try {
            const response = await axios.delete(`http://127.0.0.1:8080/manager/author_book/delete?id=${id}`);
            if (response.data.code === 0) {
                message.success('Book deleted successfully!');
                fetchAuthors();
            } else {
                message.error('Failed to delete the book.');
            }
        } catch (error) {
            console.error('Error deleting book:', error);
            message.error('Unable to delete book.');
        }
    };

    // Function to open the biography modal
    const openBiographyModal = (biography) => {
        setSelectedBiography(biography);
        setBiographyModalVisible(true);
    };

    // Function to limit the biography display length
    const truncateBiography = (biography, length = 50) => {
        return biography.length > length ? biography.substring(0, length) + '...' : biography;
    };

    const columns = [
        {
            title: 'STT',
            dataIndex: 'index',
            key: 'index',
            render: (text, record, index) => index + 1,
        },
        {
            title: 'Tên Tác Giả',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Tiểu Sử',
            dataIndex: 'biography',
            key: 'biography',
            render: (biography) => (
                <>
                    {truncateBiography(biography)}{' '}
                    {biography.length > 100 && (
                        <Button type="link" onClick={() => openBiographyModal(biography)}>
                            Xem chi tiết
                        </Button>
                    )}
                </>
            ),
        },
        {
            title: 'Ngày Sinh',
            dataIndex: 'birth_date',
            key: 'birth_date',
            render: (birth_date) => birth_date ? moment(birth_date).format('YYYY-MM-DD') : 'N/A',
        },
        {
            title: 'Ảnh Đại Diện',
            dataIndex: 'avatar',
            key: 'avatar',
            render: (avatar) => (
                <Avatar src={avatar} size={64} />
            ),
        },
        {
            title: 'Hành Động',
            key: 'action',
            render: (text, record) => (
                <span>
                    <Button type="primary" onClick={() => {
                        setSelectedAuthor(record);  // Set tác giả hiện tại
                        setUpdateModalVisible(true);  // Mở modal
                    }}>
                        Sửa
                    </Button>
                    <Popconfirm
                        title="Bạn có chắc chắn muốn xóa tác giả này không?"
                        onConfirm={() => handleDeleteBook(record.id)}
                        okText="Xóa"
                        cancelText="Hủy"
                    >
                        <Button type="dashed">Xóa</Button>
                    </Popconfirm>
                </span>
            ),
        },
    ];

    return (
        <div style={{ padding: '10px' }}>
            <h1>Quản Lý Tác Giả</h1>
            <Form
                layout="inline"
                onFinish={addAuthor}
                style={{ marginBottom: 10, maxWidth: 800 }}
            >
                <div style={{ display: 'flex' }}>
                    <Form.Item name="name" style={{ marginBottom: '10px' }}>
                        <Input placeholder="Tên Tác Giả" style={{ height: '40px' }} />
                    </Form.Item>
                    <Form.Item name="biography">
                        <Input placeholder="Tiểu Sử" style={{ height: '40px' }} />
                    </Form.Item>
                    <Form.Item name="nationality">
                        <Input placeholder="Quốc Tịch" style={{ height: '40px' }} />
                    </Form.Item>
                    <Form.Item>
                        <DatePicker style={{ height: '40px' }} onChange={(date) => setBirthDate(date)} />
                    </Form.Item>
                    <Form.Item>
                        <Upload
                            maxCount={1}
                            accept="image/jpeg,image/png"
                            beforeUpload={(file) => {
                                setImageFile(file);
                                return false;  // Ngăn upload tự động
                            }}
                            onRemove={() => {
                                setImageFile(null);
                            }}
                        >
                            <FaCloudUploadAlt />
                        </Upload>
                    </Form.Item>
                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            style={{
                                height: '40px',
                                marginLeft: 8,
                                width: '195px',
                                paddingTop: '5px',
                            }}
                        >
                            Thêm Tác Giả
                        </Button>
                    </Form.Item>
                </div>
            </Form>

            <Search
                placeholder="Tìm theo Tên Tác Giả"
                allowClear
                enterButton="Tìm kiếm"
                size="large"
                value={searchName}  // Bind the search input value
                onChange={handleSearch}  // Handle changes dynamically
                onSearch={handleSearch}  // Also handle search button click
                style={{ marginBottom: 16 }}
            />


            <Table
                columns={columns}
                dataSource={filteredAuthors}
                rowKey="id"
                loading={loading}
                pagination={{ pageSize: 10 }}
            />

            <UpdateAuthorModal
                visible={isUpdateModalVisible}
                onClose={() => setUpdateModalVisible(false)}  // Đóng modal
                onUpdate={fetchAuthors}  // Refresh danh sách sau khi cập nhật
                author={selectedAuthor}  // Pass tác giả vào modal
            />

            <Modal
                title="Tiểu Sử Tác Giả"
                visible={isBiographyModalVisible}
                onCancel={() => setBiographyModalVisible(false)}
                footer={null}
            >
                <p>{selectedBiography}</p>
            </Modal>
        </div>
    );
}

export default AuthorBook;
