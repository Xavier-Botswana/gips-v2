import PropTypes from 'prop-types';
import { useState } from 'react';

const FileUploadDropzone = ({ onChange }) => {
  const [fileName, setFileName] = useState('');

  const handleFileChange = (event) => {
    onChange(event)
    const file = event.target.files[0];
    if (file) {
      setFileName(file.name);
    } else {
      setFileName('');
    }
  };
  return (
    <div className="flex items-center justify-center w-full">
      <label
        htmlFor="dropzone-file"
        className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600"
      >
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
          <p className="mb-2  text-sm text-gray-500 dark:text-gray-400">
            {!fileName
              ? 'Click to upload or drag and drop file here *csv file only'
              : 'File uploaded,you can now submit the list'}
          </p>
        </div>
        <input
          id="dropzone-file"
          type="file"
          accept=".csv"
          className="hidden"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
      </label>
    </div>
  );
};

FileUploadDropzone.propTypes = {
  onChange: PropTypes.func.isRequired,
};

export default FileUploadDropzone;
