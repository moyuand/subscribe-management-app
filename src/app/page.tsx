import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function Home() {
  return (
    <div className="min-h-screen w-full grid place-items-center p-6">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>订阅管理</CardTitle>
          <CardDescription>Next.js + Tailwind + shadcn/ui 初始化成功</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="email" className="w-full">
            <TabsList>
              <TabsTrigger value="email">邮箱订阅</TabsTrigger>
              <TabsTrigger value="options">更多选项</TabsTrigger>
            </TabsList>
            <TabsContent value="email" className="mt-4 flex gap-2">
              <Input placeholder="输入邮箱以订阅" type="email" className="flex-1" />
              <Button>订阅</Button>
            </TabsContent>
            <TabsContent value="options" className="mt-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="plan">订阅计划</Label>
                  <Select>
                    <SelectTrigger id="plan">
                      <SelectValue placeholder="选择计划" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basic">基础版</SelectItem>
                      <SelectItem value="pro">专业版</SelectItem>
                      <SelectItem value="team">团队版</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="notify" className="mr-4">邮件通知</Label>
                  <Switch id="notify" />
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="remark">备注</Label>
                <Textarea id="remark" placeholder="填入备注信息" />
              </div>

              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline">预览</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>订阅信息预览</DialogTitle>
                  </DialogHeader>
                  <p className="text-sm text-muted-foreground">这里将展示你的选择与填写内容。</p>
                </DialogContent>
              </Dialog>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
