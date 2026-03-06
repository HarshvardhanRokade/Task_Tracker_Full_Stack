import React from 'react';
import SearchBar from './SearchBar';
import CustomDropdown from './CustomDropdown'; // <-- 1. Import your new component

export default function TaskFilters({ 
    searchQuery, 
    setSearchQuery, 
    filterPriority, 
    setFilterPriority, 
    filterStatus, 
    setFilterStatus,
    filterTag,
    setFilterTag,
    availableTags= []
}) {

    // 2. Define our dropdown options as simple arrays
    const priorityOptions = [
        { value: 'HIGH', label: 'High Priority' },
        { value: 'MEDIUM', label: 'Medium Priority' },
        { value: 'LOW', label: 'Low Priority' }
    ];

    const statusOptions = [
        { value: 'OPEN', label: 'Open Tasks' },
        { value: 'COMPLETE', label: 'Completed' }
    ];

    const tagOptions = availableTags.map((tag) => ({
        value:tag,
        label:`#${tag}`
    }));

    return (
        <div className="flex flex-col md:flex-row gap-4 mb-6">
            
            <div className="flex-1">
                <SearchBar 
                    value={searchQuery} 
                    onChange={setSearchQuery} 
                />
            </div>

            {/* 3. Use the new CustomDropdown instead of native <select> */}
            <div className="flex gap-4">
                <CustomDropdown
                    value={filterPriority}
                    onChange={setFilterPriority}
                    options={priorityOptions}
                    placeholder="All Priorities"
                />

                <CustomDropdown
                    value={filterStatus}
                    onChange={setFilterStatus}
                    options={statusOptions}
                    placeholder="All Statuses"
                />

                <CustomDropdown 
                    value={filterTag}
                    onChange={setFilterTag}
                    options={tagOptions}
                    placeholder="All Tags"
                />
            </div>
            
        </div>
    );
}