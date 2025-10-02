import { Layout } from "../../layout/layout"



export const Dashboard = () => {
    return (
        <Layout>
            <section className="dashboard__pages relative w-full overflow-y-scroll sidebar h-screen">
                <h2 className="dashboard__title font-primary p-[30px] font-secundaria">Dashboard</h2>


                {/* Grid ojo ps */}
                <div className="grid grid-cols-3 gap-[20px] mt-[4c0px] p-[30px]">
                    <article className="bg-green-100 p-[30px] rounded-[30px]">
                        <h1 className="mb-[30px] opacity-80">$980.000</h1>
                        <h3 className="mb-[20px] opacity-60">Ventas totales</h3>
                        <p className="text-green-700">+ 12% del mes pasado</p>
                    </article>
                    <article className="bg-orange-100 p-[30px] rounded-[30px]">
                        <h1 className="mb-[30px] opacity-80">34</h1>
                        <h3 className="mb-[20px] opacity-60">Estudiantes activoa</h3>
                        <p className="text-green-700">+ 8 nuevos este mes</p>
                    </article>
                    <article className="bg-yellow-100 p-[30px] rounded-[30px]">
                        <h1 className="mb-[30px] opacity-80">12</h1>
                        <h3 className="mb-[20px] opacity-60">Preinscrpcioness</h3>
                        <p className="text-green-700">5 pendientes para revisar</p>
                    </article>
                </div>
            </section>
        </Layout>
    )
}