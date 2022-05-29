function TransactionModal({ children, open, onClose }: any) {
  if (!open) return null;

  return (
    <>
      <div className="op fixed top-0 left-0 right-0 bottom-0 bg-black opacity-30"></div>
      <div className="fixed top-1/2 left-1/2 z-50 -translate-x-1/2 -translate-y-1/2 bg-black p-12">
        <button
          onClick={onClose}
          className="absolute top-0 right-0 p-4 text-gray-100"
        >
          x
        </button>
        {children}
      </div>
    </>
  );
}

export default TransactionModal;
