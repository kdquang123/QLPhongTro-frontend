import Button from '~/components/Button';
import styles from './UserBoxSearch.module.scss';
import classNames from 'classnames/bind';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faLocationDot } from '@fortawesome/free-solid-svg-icons';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Tippy from '@tippyjs/react/headless';
import 'tippy.js/dist/tippy.css';
import Wrapper from '../Popper/Wrapper';

const cx = classNames.bind(styles);

function UserBoxSearch({ sendDataToParent, onFilter }) {
    const [cityData, setCityData] = useState([]);
    const [districtData, setDistrictData] = useState([]);
    const [communeData, setCommuneData] = useState([]);
    const [address, setAddress] = useState('');
    const [selectedCity, setSelectedCity] = useState({ id: '', name: '' });
    const [selectedDistrict, setSelectedDistrict] = useState({ id: '', name: '' });
    const [selectedCommune, setSelectedCommune] = useState({ id: '', name: '' });

    // sendDataToParent(address);

    const handleCityChange = (e) => {
        let selectedId = e.target.value;

        if (selectedId === '-1') {
            setSelectedCity({ id: '', name: '' });
            sendDataToParent('');
            // setAddress('');
            return;
        } else {
            let selectedName = cityData.find((city) => (city.id === selectedId ? city.name : ''));
            sendDataToParent(selectedName.name);
            // setAddress(selectedName.name);
            setSelectedCity({ id: selectedId, name: selectedName.name });
        }
    };
    const handleDistrictChange = (e) => {
        let selectedId = e.target.value;
        if (selectedId === '-1') {
            setSelectedDistrict({ id: '', name: '' });
            sendDataToParent(selectedCity.name);
            // setAddress(selectedCity.name);
            return;
        }
        let selectedName = districtData.find((district) => (district.id === selectedId ? district.name : ''));
        sendDataToParent(selectedName.name + ', ' + selectedCity.name);
        // setAddress(selectedName.name + ', ' + selectedCity.name);
        setSelectedDistrict({ id: selectedId, name: selectedName.name });
    };
    const handleCommuneChange = (e) => {
        let selectedId = e.target.value;
        if (selectedId === '-1') {
            setSelectedCommune({ id: '', name: '' });
            sendDataToParent(`${selectedDistrict.name}, ${selectedCity.name}`);
            // setAddress(`${selectedDistrict.name}, ${selectedCity.name}`);
            return;
        }
        let selectedName = communeData.find((commune) => (commune.id === selectedId ? commune.name : ''));
        sendDataToParent(`${selectedName.name}, ${selectedDistrict.name}, ${selectedCity.name}`);
        // setAddress(`${selectedDistrict.name}, ${selectedCity.name}`);
        setSelectedCommune({ id: selectedId, name: selectedName.name });
    };

    useEffect(() => {
        axios.get(`${process.env.REACT_APP_API_CITY}`).then((response) => setCityData(response.data.data));
    }, []);
    useEffect(() => {
        axios
            .get(`${process.env.REACT_APP_API_DISTRICT + selectedCity.id}.htm`)
            .then((response) => setDistrictData(response.data.data));
        setCommuneData([]);
        setSelectedDistrict({ id: '', name: '' });
        setSelectedCommune({ id: '', name: '' });
    }, [selectedCity]);
    useEffect(() => {
        axios
            .get(`${process.env.REACT_APP_API_COMMUNE + selectedDistrict.id}.htm`)
            .then((response) => setCommuneData(response.data.data));
        setSelectedCommune({ id: '', name: '' });
    }, [selectedDistrict]);
    return (
        <div className={cx('wrapper')}>
            <div className={cx('location-search-box')}>
                <div className={cx('city-box')}>
                    <Button className={cx('select-box')} leftIcon={<FontAwesomeIcon icon={faLocationDot} />}>
                        <select className={cx('dropdown')} onChange={handleCityChange}>
                            <option value="-1">Chọn thành phố</option>
                            {cityData.map((city) => {
                                return (
                                    <option key={city.id} value={city.id}>
                                        {city.name}
                                    </option>
                                );
                            })}
                        </select>
                    </Button>
                </div>
                <div className={cx('district-box')}>
                    <Button className={cx('select-box')} leftIcon={<FontAwesomeIcon icon={faLocationDot} />}>
                        <select className={cx('dropdown')} onChange={handleDistrictChange} disabled={!selectedCity.id}>
                            <option value="-1">Chọn huyện</option>
                            {districtData.map((district) => (
                                <option key={district.id} value={district.id}>
                                    {district.name}
                                </option>
                            ))}
                        </select>
                    </Button>
                </div>
                <div className={cx('commune-box')}>
                    <Button className={cx('select-box')} leftIcon={<FontAwesomeIcon icon={faLocationDot} />}>
                        <select
                            className={cx('dropdown')}
                            onChange={handleCommuneChange}
                            disabled={!selectedDistrict.id}
                        >
                            <option value="-1">Chọn xã</option>
                            {communeData.map((commune) => (
                                <option key={commune.id} value={commune.id}>
                                    {commune.name}
                                </option>
                            ))}
                        </select>
                    </Button>
                </div>
                <div className={cx('btn-box')}>
                    <button className={cx('btn-search')} onClick={onFilter}>
                        Tìm kiếm
                    </button>
                </div>
            </div>
        </div>
    );
}

export default UserBoxSearch;
