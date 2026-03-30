import TopBar from './components/TopBar'
import TodoistPanel from './components/TodoistPanel'
import GoalPillars from './components/GoalPillars'
import DailyBrief from './components/DailyBrief'
import RightPanel from './components/RightPanel'
import { useTodoist } from './hooks/useTodoist'
import { useNotion } from './hooks/useNotion'

export default function App() {
  const {
    tasks,
    pendingTasks,
    completedTasks,
    loading: tasksLoading,
    error: tasksError,
    addTask,
    deleteTask,
    toggleTask,
  } = useTodoist()

  const {
    grouped: checklistGrouped,
    doneCount: checklistDone,
    totalCount: checklistTotal,
    loading: notionLoading,
    error: notionError,
    toggleItem: toggleNotionItem,
  } = useNotion()

  return (
    <div className="min-h-screen bg-cmd-bg text-white font-sans">
      <TopBar
        tasks={tasks}
        checklistDone={checklistDone}
        checklistTotal={checklistTotal}
      />

      {/* Main 3-column layout */}
      <div
        className="grid gap-4 p-4"
        style={{
          gridTemplateColumns: '30% 1fr 25%',
          height: 'calc(100vh - 52px)',
        }}
      >
        {/* Left: Todoist Tasks */}
        <TodoistPanel
          pendingTasks={pendingTasks}
          completedTasks={completedTasks}
          loading={tasksLoading}
          error={tasksError}
          addTask={addTask}
          deleteTask={deleteTask}
          toggleTask={toggleTask}
        />

        {/* Middle: Goal Pillars + Daily Brief */}
        <div className="flex flex-col gap-4 min-h-0">
          <GoalPillars
            checklistDone={checklistDone}
            checklistTotal={checklistTotal}
          />
          <DailyBrief />
        </div>

        {/* Right: Focus + Metrics + Checklist */}
        <RightPanel
          tasks={tasks}
          checklistGrouped={checklistGrouped}
          checklistDone={checklistDone}
          checklistTotal={checklistTotal}
          notionLoading={notionLoading}
          notionError={notionError}
          toggleNotionItem={toggleNotionItem}
        />
      </div>
    </div>
  )
}
