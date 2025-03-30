import {
    LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    Legend, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#8dd1e1', '#a4de6c', '#d0ed57'];

export const ChartContainer = ({ reportType, data, startDate, endDate }) => {
    if (!data) return <div>No data available</div>;

    switch (reportType) {
        case 'userGrowth':
            return <UserGrowthChart data={data} />;
        case 'sessions':
            return <SessionCompletionChart data={data} />;
        case 'subjects':
            return <PopularSubjectsChart data={data} />;
        case 'cities':
            return <CityUsageChart data={data} />;
        default:
            return <div>Unknown report type</div>;
    }
};

const UserGrowthChart = ({ data }) => {
    return (
        <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart
                    data={data}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="students" name="Students" stroke="#8884d8" activeDot={{ r: 8 }} />
                    <Line type="monotone" dataKey="tutors" name="Tutors" stroke="#82ca9d" />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

const SessionCompletionChart = ({ data }) => {
    return (
        <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={data}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="status" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" name="Sessions" fill="#8884d8" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

const PopularSubjectsChart = ({ data }) => {
    return (
        <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={data}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 150, bottom: 5 }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis type="category" dataKey="name" />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" name="Session Count" fill="#8884d8" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

const CityUsageChart = ({ data }) => {
    return (
        <div className="h-96 flex flex-col md:flex-row">
            <div className="w-full md:w-1/2 h-full">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={120}
                            fill="#8884d8"
                            dataKey="count"
                            nameKey="city"
                            label={({ city, percent }) => `${city}: ${(percent * 100).toFixed(0)}%`}
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </div>
            <div className="w-full md:w-1/2 h-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={data}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="city" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" name="Users" fill="#82ca9d" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};
