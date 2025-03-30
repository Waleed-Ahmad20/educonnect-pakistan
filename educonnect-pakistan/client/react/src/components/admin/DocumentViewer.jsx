import { useState } from 'react';

const DocumentViewer = ({ documents }) => {
    const [selectedDoc, setSelectedDoc] = useState(documents && documents.length > 0 ? documents[0] : null);

    if (!documents || documents.length === 0) {
        return (
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-md text-center text-gray-500">
                No documents uploaded
            </div>
        );
    }

    const getDocumentTypeLabel = (type) => {
        switch(type) {
            case 'id': return 'ID Document';
            case 'qualification': return 'Qualification';
            case 'certificate': return 'Certificate';
            default: return 'Other Document';
        }
    };

    const isImage = (url) => {
        return /\.(jpeg|jpg|png|gif|bmp)$/i.test(url);
    };

    const isPdf = (url) => {
        return /\.pdf$/i.test(url);
    };

    return (
        <div className="bg-white border border-gray-200 rounded-md overflow-hidden">
            <div className="flex border-b">
                <div className="w-1/3 border-r overflow-auto max-h-96">
                    <div className="p-2 bg-gray-50 border-b text-sm font-medium text-gray-700">Documents</div>
                    <ul className="divide-y">
                        {documents.map((doc, index) => (
                            <li 
                                key={index} 
                                className={`p-3 cursor-pointer hover:bg-gray-50 ${selectedDoc === doc ? 'bg-primary-50' : ''}`}
                                onClick={() => setSelectedDoc(doc)}
                            >
                                <div className="font-medium text-gray-800 truncate">{doc.title}</div>
                                <div className="text-xs text-gray-500 flex justify-between">
                                    <span>{getDocumentTypeLabel(doc.type)}</span>
                                    <span>{new Date(doc.uploadedAt).toLocaleDateString()}</span>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="w-2/3 p-4">
                    {selectedDoc ? (
                        <div className="flex flex-col h-full">
                            <div className="mb-3">
                                <h4 className="font-medium text-gray-800">{selectedDoc.title}</h4>
                                <p className="text-sm text-gray-500">{getDocumentTypeLabel(selectedDoc.type)}</p>
                            </div>
                            <div className="flex-grow bg-gray-50 rounded-md overflow-hidden flex items-center justify-center p-2">
                                {isImage(selectedDoc.fileUrl) ? (
                                    <img 
                                        src={`/${selectedDoc.fileUrl}`} 
                                        alt={selectedDoc.title}
                                        className="max-w-full max-h-full object-contain" 
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = "/placeholder-image.png";
                                        }}
                                    />
                                ) : isPdf(selectedDoc.fileUrl) ? (
                                    <div className="w-full h-80">
                                        <iframe 
                                            src={`/${selectedDoc.fileUrl}`}
                                            title={selectedDoc.title}
                                            className="w-full h-full"
                                        />
                                    </div>
                                ) : (
                                    <div className="text-center p-4">
                                        <p className="mb-4">Unable to preview this document type</p>
                                        <a 
                                            href={`/${selectedDoc.fileUrl}`} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700"
                                        >
                                            Download Document
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex items-center justify-center text-gray-500">
                            No document selected
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DocumentViewer;
