import React from 'react';
import { FaFacebookF, FaTwitter, FaInstagram } from 'react-icons/fa';
import styles from './index_footer.module.css';

const FooterHeader = () => {
  return (
    <footer className={styles.footerHomePage}>
      <div className={styles.footerContent}>
        <div className={styles.footerColumn}>
          <h4>Thông tin</h4>
          <ul>
            <li><a href="/about">Giới thiệu</a></li>
            <li><a href="/contact">Liên hệ</a></li>
            <li><a href="/faq">Câu hỏi thường gặp</a></li>
            <li><a href="/returns">Chính sách đổi trả</a></li>
          </ul>
        </div>
        <div className={styles.footerColumn}>
          <h4>Dịch vụ khách hàng</h4>
          <ul>
            <li><a href="/support">Hỗ trợ khách hàng</a></li>
            <li><a href="/shipping">Giao hàng</a></li>
            <li><a href="/payment">Phương thức thanh toán</a></li>
          </ul>
        </div>
        <div className={styles.footerColumn}>
          <h4>Kết nối với chúng tôi</h4>
          <ul className={styles.socialMediaLinks}>
            <li><a href="https://facebook.com" target="_blank" rel="noopener noreferrer"><FaFacebookF /> Facebook</a></li>
            <li><a href="https://twitter.com" target="_blank" rel="noopener noreferrer"><FaTwitter /> Twitter</a></li>
            <li><a href="https://instagram.com" target="_blank" rel="noopener noreferrer"><FaInstagram /> Instagram</a></li>
          </ul>
        </div>
        <div className={styles.footerColumn}>
          <h4>Thông tin liên hệ</h4>
          <ul>
            <li>Hưng Hà Thái Bình, Việt Nam</li>
            <li>Email: contact@bookstore.vn</li>
            <li>Điện thoại: +84 123 456 789</li>
          </ul>
        </div>
      </div>
      <div className={styles.footerBottom}>
        <p>© 2024 Sách Việt Nam. Bảo lưu mọi quyền.</p>
      </div>
    </footer>
  );
};

export default FooterHeader;