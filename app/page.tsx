"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Lightbulb, Wifi, Droplets, Flame, Tv, BarChart3, Save, Trash2, Edit2, Sun, Moon, Calendar } from "lucide-react";
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// Definiciones de tipos e interfaces
interface Expense {
  id: string;
  service: string;
  amount: number;
  date: string;
  icon: keyof typeof serviceIcons;
}

interface MonthlyExpense {
  month: string;
  total: number;
  expenses: Expense[];
}

const serviceIcons = {
  Electricidad: Lightbulb,
  Agua: Droplets,
  Internet: Wifi,
  Cable: Tv,
  Gas: Flame
} as const;

const services = [
  { name: 'Electricidad', icon: Lightbulb },
  { name: 'Agua', icon: Droplets },
  { name: 'Internet', icon: Wifi },
  { name: 'Cable', icon: Tv },
  { name: 'Gas', icon: Flame }
] as const;

// Función para obtener fecha actual formateada
const getCurrentMonthFormatted = () => format(new Date(), 'MMMM yyyy', { locale: es });

// Objeto base para gastos iniciales
const initialExpenses = {
  Electricidad: 0,
  Agua: 0,
  Internet: 0,
  Cable: 0,
  Gas: 0
};

export default function Home() {
  // Estados principales
  const [darkMode, setDarkMode] = useState(() => 
    typeof window !== 'undefined' ? localStorage.getItem('darkMode') === 'true' : false);
  
  const [monthlyExpenses, setMonthlyExpenses] = useState<MonthlyExpense[]>(() => 
    typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('monthlyExpenses') || '[]') : []);

  const [currentExpenses, setCurrentExpenses] = useState<{[key: string]: number}>({...initialExpenses});
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthFormatted());
  const [isEditMode, setIsEditMode] = useState(false);
  const [predictions, setPredictions] = useState<{[key: string]: number}>({...initialExpenses});
  const [activeTab, setActiveTab] = useState("services");
  
  // Efectos
  useEffect(() => {
    localStorage.setItem('monthlyExpenses', JSON.stringify(monthlyExpenses));
    localStorage.setItem('darkMode', darkMode.toString());
    
    document.documentElement.classList.toggle('dark', darkMode);
    calculatePredictions();
  }, [monthlyExpenses, darkMode]);
  
  // Funciones de cálculo y gestión
  const calculatePredictions = () => {
    if (monthlyExpenses.length < 2) return;
    
    const recentMonths = monthlyExpenses.slice(-3);
    const servicePredictions = {} as {[key: string]: number};
    
    services.forEach(service => {
      let total = 0, count = 0;
      
      recentMonths.forEach(month => {
        const expense = month.expenses.find(e => e.service === service.name);
        if (expense) {
          total += expense.amount;
          count++;
        }
      });
      
      servicePredictions[service.name] = Number((count > 0 ? (total / count) * 1.05 : 0).toFixed(2));
    });
    
    setPredictions(servicePredictions);
  };

  const updateExpense = (service: string, amount: number) => {
    setCurrentExpenses(prev => ({ ...prev, [service]: amount }));
  };

  const saveMonthlyExpenses = () => {
    const expenses: Expense[] = Object.entries(currentExpenses).map(([service, amount]) => ({
      id: crypto.randomUUID(),
      service,
      amount,
      date: new Date().toISOString(),
      icon: service as keyof typeof serviceIcons
    }));

    const total = Object.values(currentExpenses).reduce((acc, curr) => acc + curr, 0);
    const monthlyExpense: MonthlyExpense = { month: selectedMonth, total, expenses };

    setMonthlyExpenses(prev => {
      const existingIndex = prev.findIndex(e => e.month === selectedMonth);
      return existingIndex >= 0 
        ? prev.map((item, i) => i === existingIndex ? monthlyExpense : item)
        : [...prev, monthlyExpense];
    });

    setCurrentExpenses({...initialExpenses});
    
    if (isEditMode) {
      setIsEditMode(false);
      setSelectedMonth(getCurrentMonthFormatted());
    }
  };

  const editMonth = (month: string) => {
    const monthData = monthlyExpenses.find(m => m.month === month);
    if (monthData) {
      const expenseValues = {
        ...initialExpenses,
        ...monthData.expenses.reduce((acc, expense) => ({
          ...acc,
          [expense.service]: expense.amount
        }), {})
      };
      
      setCurrentExpenses(expenseValues as {[key: string]: number});
      setSelectedMonth(month);
      setIsEditMode(true);
      setMonthlyExpenses(prev => prev.filter(m => m.month !== month));
      
      // Cambiar a la pestaña de servicios
      setActiveTab("services");
    }
  };

  const deleteMonth = (month: string) => {
    setMonthlyExpenses(prev => prev.filter(m => m.month !== month));
  };

  // Generación de datos para UI - MODIFICADO: Solo 5 meses (actual + 4 anteriores)
  const generateMonthOptions = () => {
    const options = [];
    const currentDate = new Date();
    
    for (let i = -4; i <= 0; i++) {
      const date = new Date(currentDate);
      date.setMonth(currentDate.getMonth() + i);
      options.push(format(date, 'MMMM yyyy', { locale: es }));
    }
    
    return options;
  };
  
  const monthOptions = generateMonthOptions();

  const chartData = monthlyExpenses.map(month => ({
    name: month.month,
    total: month.total,
    ...month.expenses.reduce((acc, expense) => ({
      ...acc,
      [expense.service]: expense.amount
    }), {})
  }));

  // Componente para el selector de meses mejorado
  const MonthSelector = () => (
    <Card className="border shadow-sm">
      <CardContent className="p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 min-w-[200px]">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            <div className="relative w-full">
              <select 
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full pl-3 pr-8 py-2 appearance-none rounded-md border bg-background focus:ring-2 focus:ring-primary focus:border-primary"
              >
                {monthOptions.map(month => (
                  <option key={month} value={month}>{month}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-muted-foreground">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                </svg>
              </div>
            </div>
          </div>
          
          {isEditMode && (
            <Button 
              variant="outline" 
              onClick={() => {
                setIsEditMode(false);
                setSelectedMonth(getCurrentMonthFormatted());
                setCurrentExpenses({...initialExpenses});
              }}
            >
              Cancelar Edición
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <main className={`min-h-screen p-8 bg-background ${darkMode ? 'dark' : ''}`}>
      <Card className="max-w-6xl mx-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-3xl font-bold">Gestión de Gastos del Hogar</CardTitle>
            <CardDescription>
              Administra y monitorea tus gastos de servicios básicos
            </CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => setDarkMode(!darkMode)}
            aria-label="Toggle dark mode"
          >
            {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
        </CardHeader>

        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList>
              <TabsTrigger value="services">Servicios</TabsTrigger>
              <TabsTrigger value="prediction">Predicción</TabsTrigger>
              <TabsTrigger value="analytics">Análisis</TabsTrigger>
            </TabsList>

            <TabsContent value="services" className="space-y-6">
              <div className="mb-4">
                <h3 className="text-lg font-medium mb-2 flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  {isEditMode ? "Editando mes:" : "Mes actual:"}
                </h3>
                <MonthSelector />
              </div>
              
              <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {services.map(service => {
                  const Icon = service.icon;
                  return (
                    <Card key={service.name}>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Icon className="h-5 w-5" />
                          {service.name}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Label>Monto</Label>
                        <Input
                          type="number"
                          placeholder="Monto en $"
                          value={currentExpenses[service.name] || ''}
                          onChange={(e) => updateExpense(service.name, Number(e.target.value))}
                        />
                      </CardContent>
                    </Card>
                  );
                })}
              </section>

              <section className="flex justify-end">
                <Button onClick={saveMonthlyExpenses}>
                  <Save className="h-4 w-4 mr-2" />
                  {isEditMode ? "Actualizar Gastos del Mes" : "Guardar Gastos del Mes"}
                </Button>
              </section>
            </TabsContent>
            
            <TabsContent value="prediction" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Predicción de Gastos para el Próximo Mes
                  </CardTitle>
                  <CardDescription>
                    Basado en tu historial de gastos de los últimos meses
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {monthlyExpenses.length < 2 ? (
                    <section className="p-4 bg-muted border border-border rounded-lg text-center">
                      <p>Necesitas al menos 2 meses de datos para generar predicciones</p>
                    </section>
                  ) : (
                    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {services.map(service => {
                        const Icon = service.icon;
                        return (
                          <Card key={service.name}>
                            <CardHeader>
                              <CardTitle className="flex items-center gap-2">
                                <Icon className="h-5 w-5" />
                                {service.name}
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <section className="text-center">
                                <p className="text-2xl font-bold">
                                  ${predictions[service.name]}
                                </p>
                                <p className="text-sm text-muted-foreground mt-2">
                                  Predicción para el próximo mes
                                </p>
                              </section>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </section>
                  )}
                  
                  <section className="mt-6">
                    <h3 className="text-lg font-semibold mb-4">Tendencia de Gastos</h3>
                    {monthlyExpenses.length < 2 ? (
                      <p className="text-muted-foreground">Necesitas más datos para mostrar tendencias</p>
                    ) : (
                      <section className="h-[300px] mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            {services.map((service, index) => (
                              <Line 
                                key={service.name}
                                type="monotone" 
                                dataKey={service.name} 
                                stroke={`hsl(var(--chart-${index + 1}))`} 
                                activeDot={{ r: 8 }}
                              />
                            ))}
                          </LineChart>
                        </ResponsiveContainer>
                      </section>
                    )}
                  </section>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Análisis de Gastos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <section className="h-[400px] mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        {services.map((service, index) => (
                          <Bar key={service.name} dataKey={service.name} fill={`hsl(var(--chart-${index + 1}))`} />
                        ))}
                      </BarChart>
                    </ResponsiveContainer>
                  </section>

                  <section className="mt-6">
                    <h3 className="text-lg font-semibold mb-4">Historial de Gastos Mensuales</h3>
                    <section className="space-y-4">
                      {monthlyExpenses.map((month) => (
                        <Card key={month.month}>
                          <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="text-lg">{month.month}</CardTitle>
                            <section className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => editMonth(month.month)}
                                title="Editar en pestaña Servicios"
                              >
                                <Edit2 className="h-4 w-4" />
                                <span className="sr-only">Editar en Servicios</span>
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => deleteMonth(month.month)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </section>
                          </CardHeader>
                          <CardContent>
                            <section className="space-y-2">
                              {month.expenses.map((expense) => {
                                const Icon = serviceIcons[expense.icon];
                                return (
                                  <article key={expense.id} className="flex items-center justify-between p-2">
                                    <section className="flex items-center gap-2">
                                      <Icon className="h-4 w-4" />
                                      <span>{expense.service}</span>
                                    </section>
                                    <span>${expense.amount}</span>
                                  </article>
                                );
                              })}
                              <article className="flex items-center justify-between p-2 font-bold border-t">
                                <span>Total del Mes</span>
                                <span>${month.total}</span>
                              </article>
                            </section>
                          </CardContent>
                        </Card>
                      ))}
                    </section>
                  </section>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </main>
  );
}