import { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { FaCloudUploadAlt } from 'react-icons/fa';

const DropFileInput = ({ onChange }) => {
  const wrapperRef = useRef(null);

  const [fileList, setFileList] = useState([]);

  const onFileDrop = (e) => {
    const newFile = e.target.files[0];
    if (newFile) {
      const updatedList = [...fileList, newFile];
      setFileList(updatedList);
      onChange(e);
    }
  };

  const fileRemove = (file) => {
    const updatedList = [...fileList];
    updatedList.splice(fileList.indexOf(file), 1);
    setFileList(updatedList);
  };

  return (
    <>
      <div
        style={{ borderRadius: 10, border: '1px solid #356f9d' }}
        ref={wrapperRef}
        role="button"
        tabIndex="0"
        className="drop-file-input"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            document.querySelector('.input-field').click();
          }
        }}
        onClick={() => document.querySelector('.input-field').click()}
      >
        <div className="drop-file-input__label" style={{ borderRadius: 10 }}>
          <FaCloudUploadAlt size={40} color="#356f9d" />
          <p style={{ fontSize: '12px', fontWeight: '300', paddingBottom: '7px' }}>Drag & Drop Files here</p>
          <p
            style={{
              background: '#356f9d',
              borderRadius: '4px',
              fontWeight: '100',
              padding: '5px 14px 5px 14px',
              color: '#ffffff',
              border: 'none',
              fontSize: '11px',
            }}
          >
            {' '}
            Choose File
          </p>
        </div>
        <input type="file" className="input-field" onChange={onFileDrop} hidden />
      </div>

      {fileList.length > 0 && (
        <div className="drop-file-preview">
          <p className="drop-file-preview__title">Ready to upload</p>
          {fileList.map((item, index) => (
            <div
              key={index}
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 20,
              }}
            >
              <span>{item.name}</span>
              <span
                style={{ cursor: 'pointer' }}
                onClick={() => fileRemove(item)}
                tabIndex="0"
                role="button"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') fileRemove(item);
                }}
              >
                x
              </span>
            </div>
          ))}
        </div>
      )}
    </>
  );
};
DropFileInput.propTypes = {
  onChange: PropTypes.func.isRequired,
};

export default DropFileInput;
