import { ActionLink, Container } from "../shared";

const MainPage: React.FC = () => {
    return (
        <Container className="py-6">
            <div className="space-y-6">
                <header>
                    <h1 className="text-2xl font-semibold">Seat Plan</h1>
                    <p className="text-sm text-gray-500">
                        Use the clubs, regatta management, and boat setup flows to manage race planning.
                    </p>
                </header>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    <section className="md:col-span-2 rounded-lg border bg-white p-5 shadow-sm">
                        <div className="mb-4">
                            <h2 className="text-lg font-semibold">Quick actions</h2>
                            <p className="mt-1 text-sm text-gray-500">
                                Jump straight into the most common planning flows.
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <ActionLink to="/" variant="primary">Open clubs</ActionLink>
                            <ActionLink to="/manage" variant="success">Manage regatta</ActionLink>
                            <ActionLink to="/setupboard" variant="accent">Open setup board</ActionLink>
                            <ActionLink to="/allconfigs" variant="neutral">View all configs</ActionLink>
                        </div>
                    </section>

                    <aside className="rounded-lg border bg-white p-4 shadow-sm">
                        <div className="text-xs uppercase tracking-wide text-gray-500">Workspace</div>
                        <div className="mt-2 space-y-3 text-sm text-gray-600">
                            <p>Club setup, regatta planning, and boat configuration are now organized into dedicated pages.</p>
                            <p>Start from clubs to select context, then move into races and seat planning.</p>
                        </div>
                    </aside>
                </div>
            </div>
        </Container>
    )
}

export default MainPage;