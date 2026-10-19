const Filter = ({filter, handleFilterChange}) => {
    return (
        <div>
            filter show with <input value={filter} onChange={handleFilterChange} />
        </div>
    )
}

export default Filter