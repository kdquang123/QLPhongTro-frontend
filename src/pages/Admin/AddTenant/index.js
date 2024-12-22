import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import classNames from 'classnames/bind'; // Import classnames bind
import styles from './AddTenant.module.scss'; // Import your SCSS module
import { getToken } from '~/utils/auth';

const cx = classNames.bind(styles); // Bind the classNames to your styles

export default function AddTenant() {
    const { id } = useParams();
    const [url] = useState(process.env.REACT_APP_API_TENANRS);
    const [urlRoom] = useState(process.env.REACT_APP_API_HOUSES_ROOMS);
    const [tenant, setTenant] = useState({
        fullName: '',
        phoneNumber: '',
        email: '',
        isRepresentative: 0,
        room: { id: `${id}` },
    });
    const [alltenant, setallTenant] = useState([]);
    const [room, setRoom] = useState(null);

    // Fetch room data
    useEffect(() => {
        const fetchRoomData = async () => {
            try {
                const response = await axios.get(`${urlRoom}/${id}`, {
                    headers: {
                        Authorization: `Bearer ${getToken()}`,
                        'Content-Type': 'application/json',
                    },
                });
                setRoom(response.data);
            } catch (error) {
                console.error('Error fetching room data:', error);
                alert('Failed to fetch room data. Please try again.');
            }
        };
        fetchRoomData();
    }, [id, urlRoom]);

    // Fetch all tenants
    useEffect(() => {
        const fetchRoomData = async () => {
            try {
                const response = await axios.get(`${url}/all`, {
                    headers: {
                        Authorization: `Bearer ${getToken()}`,
                        'Content-Type': 'application/json',
                    },
                });
                setallTenant(response.data);
            } catch (error) {
                console.error('Error fetching tenant data:', error);
                alert('Failed to fetch tenant data.');
            }
        };
        fetchRoomData();
    }, [url]);

    const totalTenantByIdRoom = () => {
        const filtered = alltenant.filter((item) => item.room.id === parseInt(id));
        return filtered.length;
    };

    const canAddTenant = () => {
        if (room && room.maxOccupants !== undefined) {
            return totalTenantByIdRoom() < room.maxOccupants;
        }
        return true;
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setTenant((prevTenant) => ({
            ...prevTenant,
            [name]: name === 'isRepresentative' ? parseInt(value) : value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!tenant.fullName || !tenant.phoneNumber || !tenant.email) {
            alert('Please fill in all the required fields');
            return;
        }

        if (!canAddTenant()) {
            alert('Cannot add tenant. Room is fully occupied.');
            return;
        }

        const updatedRoom = {
            ...room,
            occupancyStatus: 1,
        };

        await axios.put(`${urlRoom}/${id}`, updatedRoom, {
            headers: {
                Authorization: `Bearer ${getToken()}`,
                'Content-Type': 'application/json',
            },
        });

        setRoom(updatedRoom);

        try {
            const response = await axios.post(`${url}`, tenant, {
                headers: {
                    Authorization: `Bearer ${getToken()}`,
                    'Content-Type': 'application/json',
                },
            });

            setTenant({
                fullName: '',
                phoneNumber: '',
                email: '',
                isRepresentative: 0,
                room: { id: `${id}` },
            });

            alert('Tenant added successfully');
            window.history.back();
        } catch (error) {
            console.error('Error adding tenant:', error);
            alert('An error occurred, please try again later!');
        }
    };

    return (
        <div className={cx('formContainer')}>
            <form onSubmit={handleSubmit}>
                <h2>Thêm khách thuê</h2>

                <div>
                    <label htmlFor="fullName">Tên khách thuê</label>
                    <input
                        type="text"
                        id="fullName"
                        name="fullName"
                        value={tenant.fullName}
                        onChange={handleInputChange}
                        placeholder="Nhập tên"
                        className={cx('inputField', {
                            focus: tenant.fullName.length > 0,
                        })}
                        required
                    />
                </div>

                <div>
                    <label htmlFor="phoneNumber">Số điện thoại</label>
                    <input
                        type="tel"
                        id="phoneNumber"
                        name="phoneNumber"
                        value={tenant.phoneNumber}
                        onChange={handleInputChange}
                        placeholder="Nhập số điện thoại"
                        className={cx('inputField')}
                        required
                    />
                </div>

                <div>
                    <label htmlFor="email">Email</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={tenant.email}
                        onChange={handleInputChange}
                        placeholder="Nhập email"
                        className={cx('inputField')}
                        required
                    />
                </div>

                <div>
                    <label htmlFor="isRepresentative">Có đại diện phòng không?</label>
                    <select
                        id="isRepresentative"
                        name="isRepresentative"
                        value={tenant.isRepresentative}
                        onChange={handleInputChange}
                        className={cx('selectField')}
                    >
                        <option value={0}>No</option>
                        <option value={1}>Yes</option>
                    </select>
                </div>

                <button type="submit" className={cx('submitButton')}>
                    Thêm khách thuê
                </button>
            </form>
        </div>
    );
}
