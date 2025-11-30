export default function Dashboard() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">
                    Dashboard
                </h1>
                <p className="text-muted-foreground mt-2">
                    Visión general del sistema de inventario
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="bg-card rounded-lg border border-border p-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium text-muted-foreground">
                            Total Activos
                        </h3>
                    </div>
                    <p className="text-3xl font-bold text-foreground mt-2">150</p>
                    <p className="text-sm text-muted-foreground mt-1">
                        +12% desde el mes pasado
                    </p>
                </div>

                <div className="bg-card rounded-lg border border-border p-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium text-muted-foreground">
                            Asignados
                        </h3>
                    </div>
                    <p className="text-3xl font-bold text-foreground mt-2">89</p>
                    <p className="text-sm text-muted-foreground mt-1">
                        59% del total
                    </p>
                </div>

                <div className="bg-card rounded-lg border border-border p-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium text-muted-foreground">
                            En Mantenimiento
                        </h3>
                    </div>
                    <p className="text-3xl font-bold text-foreground mt-2">8</p>
                    <p className="text-sm text-muted-foreground mt-1">
                        3 preventivos, 5 correctivos
                    </p>
                </div>

                <div className="bg-card rounded-lg border border-border p-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium text-muted-foreground">
                            Valor Total
                        </h3>
                    </div>
                    <p className="text-3xl font-bold text-foreground mt-2">$245K</p>
                    <p className="text-sm text-muted-foreground mt-1">
                        Valor de adquisición
                    </p>
                </div>
            </div>

            {/* Coming Soon */}
            <div className="bg-card rounded-lg border border-border p-12 text-center">
                <h2 className="text-2xl font-bold text-foreground mb-2">
                    Gráficos y Estadísticas
                </h2>
                <p className="text-muted-foreground">
                    Los gráficos interactivos se agregarán próximamente...
                </p>
            </div>
        </div>
    );
}
