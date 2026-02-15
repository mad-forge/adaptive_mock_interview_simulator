import { lazy, useEffect, useState, Suspense } from "react";


import { Route, Routes } from "react-router-dom";

const InterviewPage = lazy(() => import("../pages/interviewPage"));

const homeRoutes = [
    {
        path: "/",
        parent: "INTERVIEW",
        permissions: "VIEW_INTERVIEW",
        exact: true,
        component: InterviewPage,
    },
];





const PagesRoute = () => {
    const [allRoutes, setAllRoutes] = useState([]);

    useEffect(() => {
        setAllRoutes(homeRoutes)
    }, []);


    const generateRoute = (allRoutes) => {
        let _data = [];
        allRoutes.map(({ path, component, navigate }, i) => {
            const Component = component;
            _data.push(
                <Route
                    path={path}
                    key={i}
                    exact={true}
                    element={
                        navigate ? (
                            <Navigate replace to={navigate} />
                        ) : (
                            <Suspense fallback={<></>}>
                                <Component />
                            </Suspense>
                        )
                    }
                />
            );
        });
        return <Routes>{_data}</Routes>;
    };

    return (
        <div>
            {generateRoute(allRoutes)}
        </div>
    );
};

export default PagesRoute;