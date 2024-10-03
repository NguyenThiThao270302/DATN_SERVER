import React, { useState } from 'react';
import { Breadcrumb, Layout, Menu, theme, Tabs, Button } from 'antd';
import { GiAbstract078, GiWantedReward } from 'react-icons/gi';
import { GrUserAdmin } from 'react-icons/gr';
import { IoMdCloudUpload } from 'react-icons/io';
import { FcBarChart, FcMindMap } from 'react-icons/fc';
import { LuClipboardList, LuFileBarChart } from 'react-icons/lu';
import { TbLogout2, TbUsersGroup } from 'react-icons/tb';
import { FaUserTie } from 'react-icons/fa';
import { CiLineHeight } from 'react-icons/ci';
import { FiPieChart } from 'react-icons/fi';

import './admin_index.css';
import UploadBook from './UploadBook';
import ListBooks from './ListBooks';
import AuthorBook from './AuthorBook';
import Publishers from './Publishers';
import TypeBook from './TypeBook';
import ListOrder from './ListOrder';
import ListCustomer from './ListCustomer';
import LoyPoints from './LoyPoints';
import BieuDoThongKe from './BieuDoThongKe';

const { Header, Content, Sider } = Layout;

const clearLocalStorageAndReload = () => {
    localStorage.clear();
    window.location.reload();
};

const items1 = [
    {
        key: 'logout',
        icon: (
            <Button
                onClick={clearLocalStorageAndReload}
                style={{
                    backgroundColor: 'gray'
                }}
            >
                <TbLogout2 />
            </Button>
        ),
    },
    {
        key: 'abstract',
        icon: (
            <FcMindMap
                style={{
                    justifyContent: 'center',
                    fontSize: '60px',
                }}
            />
        ),
    },
];

const tabsContent = [
    {
        key: '1',
        label: (
            <span className="tab-label">
                <IoMdCloudUpload className="icon" /> Tải thông tin sách
            </span>
        ),
        content: <div><UploadBook /></div>,
    },
    {
        key: '2',
        label: (
            <span className="tab-label" style={{ fontSize: '17px' }}>
                <FcBarChart className="icon" /> Quản lý danh mục
            </span>
        ),
        content: <div><TypeBook /></div>,
    },
    {
        key: '3',
        label: (
            <span className="tab-label" style={{ fontSize: '17px' }}>
                <FaUserTie style={{ fontSize: '25px' }} className="icon" /> Quản lý tác giả
            </span>
        ),
        content: <div><AuthorBook /></div>,
    },
    {
        key: '4',
        label: (
            <span className="tab-label" style={{ fontSize: '17px', color: '#4a4a4a' }}>
                <LuClipboardList style={{ fontSize: '40px' }} className="icon-quan-ly-sach9" />Quản lý nhà xuất bản
            </span>
        ),
        content: <div><Publishers /></div>,
    },
    {
        key: '5',
        label: (
            <span className="tab-label" style={{ fontSize: '17px', color: '#4a4a4a' }}>
                <CiLineHeight style={{ fontSize: '25px' }} className="icon-quan-ly-khach-hang" /> Quản lý sách
            </span>
        ),
        content: <div><ListBooks /></div>,
    },
    {
        key: '6',
        label: (
            <span className="tab-label" style={{ fontSize: '17px', color: '#4a4a4a' }}>
                <GiWantedReward style={{ fontSize: '25px' }} className="icon-quan-ly-khach-hang" /> Quản lý điểm
            </span>
        ),
        content: <div><LoyPoints /></div>,
    },
    {
        key: '7',
        label: (
            <span className="tab-label" style={{ fontSize: '17px', color: '#4a4a4a' }}>
                <TbUsersGroup style={{ fontSize: '25px' }} className="icon-quan-ly-khach-hang" /> Quản lý khách hàng
            </span>
        ),
        content: <div><ListCustomer /></div>,
    },
    {
        key: '8',
        label: (
            <span className="tab-label" style={{ fontSize: '17px', color: '#4a4a4a' }}>
                <LuFileBarChart style={{ fontSize: '25px' }} className="icon-quan-ly-khach-hang" /> Thống kê đơn hàng
            </span>
        ),
        content: <div><ListOrder /></div>,
    },
    {
        key: '9',
        label: (
            <span className="tab-label" style={{ fontSize: '17px', color: '#4a4a4a' }}>
                <FiPieChart style={{ fontSize: '25px' }} className="icon-quan-ly-khach-hang" /> Thống kê doanh thu
            </span>
        ),
        content: <div><BieuDoThongKe /></div>,
    },
];

const items2 = [
    {
        key: 'sub1',
        icon: <GrUserAdmin />,
        label: (
            <span style={{ fontSize: '18px' }}>
                Quản lý
            </span>
        ),
        children: tabsContent.map(tab => ({
            key: tab.key,
            label: tab.label,
            content: tab.content,
        })),
    },
];

function Dashboard() {
    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();

    const [activeMenuItem, setActiveMenuItem] = useState('1');

    const handleMenuClick = ({ key }) => {
        setActiveMenuItem(key);
    };

    return (
        <div style={{ height: 'auto', display: 'flex', flexDirection: 'column' }}>
            <Layout style={{ height: 'auto',marginTop:'-60px'}}>
                <Header
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        background: 'linear-gradient(90deg, rgba(255, 189, 68, 1) 0%, rgba(240, 98, 146, 1) 35%, rgba(0, 122, 166, 1) 100%)',
                        position: 'sticky',
                        top: 0,
                        zIndex: 1,
                        width: '100%',
                    }}
                >
                    <div className="demo-logo" />
                    <Menu
                        theme="dark"
                        mode="horizontal"
                        defaultSelectedKeys={['abstract']}
                        items={items1}
                        style={{
                            flex: 1,
                            alignItems: 'center',
                            background: 'transparent',
                        }}
                    />
                </Header>
                <Layout style={{ flex: 1, overflow: 'auto' }}>
                    <Sider
                        width={250}
                        style={{
                            background: colorBgContainer,
                            overflow: 'auto',
                            height: '100%',
                            position: 'fixed',
                            left: 0,
                        }}
                    >
                        <Menu
                            mode="inline"
                            defaultSelectedKeys={['sub1']}
                            defaultOpenKeys={['sub1']}
                            style={{
                                height: '100%',
                                borderRight: 0,
                            }}
                            items={items2}
                            onClick={handleMenuClick}
                        />
                    </Sider>
                    <Layout
                        style={{
                            padding: '0 24px 24px',
                            marginLeft: 250,
                        }}
                    >
                        <Breadcrumb
                            style={{
                                margin: '16px 0',
                            }}
                        />
                        <Content
                            style={{
                                padding: 24,
                                margin: 0,
                                minHeight: 280,
                                background: colorBgContainer,
                                borderRadius: borderRadiusLG,
                                overflow: 'auto',
                            }}
                        >
                            <Tabs
                                activeKey={activeMenuItem}
                                items={tabsContent.map(tab => ({
                                    key: tab.key,
                                    children: tab.content,
                                }))}
                            />
                        </Content>
                    </Layout>
                </Layout>
            </Layout>
        </div>
    );
}

export default Dashboard;