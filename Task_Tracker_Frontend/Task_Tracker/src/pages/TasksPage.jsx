import React from 'react';
import TaskFilters from '../components/TaskFilters';
import TaskCard from '../components/TaskCard';

export default function TasksPage({
  tasks,
  searchQuery, setSearchQuery,
  filterStatus, setFilterStatus,
  filterPriority, setFilterPriority,
  filterTag, setFilterTag,
  availableTags,
  isLoading,
  lastTaskElementRef,
  setTaskToEdit,
  setTaskToDelete,
  handleToggleStatus
}) {
  return (
    <div className="animate-in fade-in duration-300">
      
      {/* Page Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-black tracking-tight mb-2 text-white">Your Tasks</h2>
        <p className="text-[#8686AC]">Manage and organize your upcoming work.</p>
      </div>

      <div className="mb-8">
        <TaskFilters
          searchQuery={searchQuery} setSearchQuery={setSearchQuery}
          filterStatus={filterStatus} setFilterStatus={setFilterStatus}
          filterPriority={filterPriority} setFilterPriority={setFilterPriority}
          filterTag={filterTag} setFilterTag={setFilterTag}
          availableTags={availableTags}
        />
      </div>

      {/* Task List Wrapper */}
      <div className="flex flex-col border border-[#272757] rounded-2xl bg-[#0F0E47] shadow-xl overflow-hidden">
        {tasks.map((task, index) => {
          const isLastElement = tasks.length === index + 1;
          return (
            <div ref={isLastElement ? lastTaskElementRef : null} key={task.id}>
              <TaskCard
                task={task}
                onEdit={setTaskToEdit}
                onDelete={setTaskToDelete}
                onToggleStatus={handleToggleStatus}
              />
            </div>
          );
        })}

        {isLoading && (
          <div className="text-center py-6 text-[#8686AC] text-sm font-medium border-t border-[#272757]">
            Loading more tasks...
          </div>
        )}

        {tasks.length === 0 && !isLoading && (
          <div className="text-center py-24 flex flex-col items-center">
            <p className="text-lg font-medium text-white">No tasks found</p>
            <p className="text-sm text-[#8686AC] mt-1">Adjust your filters or create a new task to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
}