import React, { useState } from 'react';
import classnames from 'classnames';
import axios from 'axios';
import styles from './AddProperties.module.scss';
import auth, { getToken, getUserId } from '~/utils/auth';

const AddProperties: React.FC = () => {
    const [url] = useState(process.env.REACT_APP_API_HOUSES);
    const [house, setHouse] = useState({
        name: '',
        address: '',
        totalRooms: 1,
        description: '',
        status: 1,
        createdAt: new Date().toISOString().split('T')[0],
        user: { id: getUserId() },
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setHouse((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (house.totalRooms <= 0) {
            alert('Tổng số phòng phải lớn hơn 0');
            return;
        }

        try {
            // Gửi request POST tới API backend
            const response = await axios.post(
                `${url}`,
                {
                    name: house.name,
                    address: house.address,
                    totalRooms: house.totalRooms,
                    description: house.description,
                    status: house.status,
                    createdAt: house.createdAt,
                    user: { id: getUserId() },
                },
                {
                    headers: {
                        Authorization: `Bearer ${getToken()}`,
                        'Content-Type': 'application/json',
                    },
                },
            );
            console.log('Tòa nhà đã được thêm:', response.data);

            // Reset form nếu cần
            setHouse({
                name: '',
                address: '',
                totalRooms: 1,
                description: '',
                status: 1,
                createdAt: new Date().toISOString().split('T')[0],
                user: { id: getUserId() },
            });

            alert('Tòa nhà đã được thêm thành công!');
            window.history.back();
        } catch (error) {
            console.error('Lỗi khi thêm tòa nhà:', error.response?.data || error.message);
            console.log('Dữ liệu gửi đi:', house);
            alert('Đã xảy ra lỗi khi thêm tòa nhà!');
        }
    };

    return (
        <div className={classnames(styles.addHouseContainer)}>
            <h2 className={classnames(styles.title)}>Thêm Mới Tòa Nhà</h2>
            <form onSubmit={handleSubmit} className={classnames(styles.addHouseForm)}>
                <div className={classnames(styles.formGroup)}>
                    <label htmlFor="name" className={classnames(styles.label)}>
                        Tên Tòa Nhà
                    </label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={house.name}
                        onChange={handleChange}
                        className={classnames(styles.input)}
                        required
                    />
                </div>

                <div className={classnames(styles.formGroup)}>
                    <label htmlFor="address" className={classnames(styles.label)}>
                        Địa Chỉ
                    </label>
                    <input
                        type="text"
                        id="address"
                        name="address"
                        value={house.address}
                        onChange={handleChange}
                        className={classnames(styles.input)}
                        required
                    />
                </div>

                <div className={classnames(styles.formGroup)}>
                    <label htmlFor="totalRooms" className={classnames(styles.label)}>
                        Tổng Số Phòng
                    </label>
                    <input
                        type="number"
                        id="totalRooms"
                        name="totalRooms"
                        value={house.totalRooms}
                        onChange={handleChange}
                        min="1"
                        className={classnames(styles.input)}
                        required
                    />
                </div>

                <div className={classnames(styles.formGroup)}>
                    <label htmlFor="description" className={classnames(styles.label)}>
                        Miêu Tả
                    </label>
                    <textarea
                        id="description"
                        name="description"
                        value={house.description}
                        onChange={handleChange}
                        className={classnames(styles.textarea)}
                        rows={4}
                    />
                </div>

                <div className={classnames(styles.formGroup)}>
                    <label htmlFor="status" className={classnames(styles.label)}>
                        Trạng Thái
                    </label>
                    <select
                        id="status"
                        name="status"
                        value={house.status}
                        onChange={handleChange}
                        className={classnames(styles.select)}
                    >
                        <option value={1}>Hoạt động</option>
                        <option value={0}>Tạm ngừng</option>
                    </select>
                </div>

                <div className={classnames(styles.formGroup)}>
                    <label htmlFor="createdAt" className={classnames(styles.label)}>
                        Ngày Tạo
                    </label>
                    <input
                        type="date"
                        id="createdAt"
                        name="createdAt"
                        value={house.createdAt}
                        onChange={handleChange}
                        className={classnames(styles.input)}
                        max={new Date().toISOString().split('T')[0]}
                        required
                    />
                </div>

                <button type="submit" className={classnames(styles.submitButton)}>
                    Thêm Tòa Nhà
                </button>
            </form>
        </div>
    );
};

export default AddProperties;
