import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { PrismaClient } from "@prisma/client";
import { DashboardHeader } from "./DashboardHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Separator } from "@/components/ui/Separator";
import { 
  FileText, 
  Users, 
  Building, 
  Plus, 
  Upload, 
  TrendingUp,
  Clock,
  Shield,
  Download
} from "lucide-react";
const prisma = new PrismaClient();
async function getDashboardData(session: any) {
    if (session.user.accountType === "COMPANY") {
        // Fetch documents only for the user's company
        return prisma.document.findMany({
            where: { companyId: session.user.companyId },
        });
    }
    if (session.user.accountType === "CABINET") {
        // Fetch companies associated with the user's cabinet
        return prisma.companyCabinet.findMany({
            where: { cabinetId: session.user.cabinetId },
            include: { company: true },
        });
    }
    return [];
}
export default async function DashboardPage() {
    const session = await getServerSession(authOptions);
    if (!session) {
        redirect("/login");
    }
    
    const data = await getDashboardData(session);
    const isCompany = session.user.accountType === "COMPANY";

    return (
        <div className="min-h-screen bg-background">
            {/* <DashboardHeader /> */}
            
            <main className="container mx-auto px-6 py-8">
                {/* Welcome Section */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">
                                Welcome back{isCompany ? "" : ", Admin"}
                            </h1>
                            <p className="text-muted-foreground">
                                {isCompany 
                                    ? "Manage your company documents and workflows" 
                                    : "Oversee your cabinet operations and client relationships"
                                }
                            </p>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                {isCompany ? "Upload Document" : "Add Company"}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                {isCompany ? "Documents" : "Companies"}
                            </CardTitle>
                            <FileText className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{data.length}</div>
                            <p className="text-xs text-muted-foreground">
                                <span className="text-green-600">+2.1%</span> from last month
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">2.4 GB</div>
                            <p className="text-xs text-muted-foreground">of 10 GB plan</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Team Members</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">5</div>
                            <p className="text-xs text-muted-foreground">active users</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
                            <Clock className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">12</div>
                            <p className="text-xs text-muted-foreground">actions this week</p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {/* Recent Items */}
                    <Card className="md:col-span-2">
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                {isCompany ? (
                                    <>
                                        <FileText className="mr-2 h-5 w-5" />
                                        Recent Documents
                                    </>
                                ) : (
                                    <>
                                        <Building className="mr-2 h-5 w-5" />
                                        Managed Companies
                                    </>
                                )}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {data.length > 0 ? (
                                <div className="space-y-4">
                                    {data.slice(0, 5).map((item: any, index: number) => (
                                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center">
                                                    <FileText className="h-4 w-4 text-primary" />
                                                </div>
                                                <div>
                                                    <p className="font-medium">Item {index + 1}</p>
                                                    <p className="text-sm text-muted-foreground">Recently added</p>
                                                </div>
                                            </div>
                                            <Badge variant="secondary">Recent</Badge>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                                        <FileText className="h-6 w-6 text-muted-foreground" />
                                    </div>
                                    <p className="text-muted-foreground">No items yet</p>
                                    <Button className="mt-3">
                                        <Plus className="mr-2 h-4 w-4" />
                                        Add First Item
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Quick Actions */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Shield className="mr-2 h-5 w-5" />
                                Quick Actions
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Button variant="outline" className="w-full justify-start">
                                <Upload className="mr-2 h-4 w-4" />
                                Upload Document
                            </Button>
                            <Button variant="outline" className="w-full justify-start">
                                <Users className="mr-2 h-4 w-4" />
                                Manage Team
                            </Button>
                            <Button variant="outline" className="w-full justify-start">
                                <Shield className="mr-2 h-4 w-4" />
                                Settings
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}