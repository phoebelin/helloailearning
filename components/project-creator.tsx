"use client"

import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"

export function ProjectCreator() {
  return (
    <div className="bg-[#e8def8] rounded-lg p-8 space-y-6">
      <div className="flex flex-wrap gap-4 items-center">
        <span>I want to use AI to teach my</span>
        <Select defaultValue="6th">
          <SelectTrigger className="w-[180px] bg-white">
            <SelectValue placeholder="Select grade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="6th">6th graders</SelectItem>
            <SelectItem value="7th">7th graders</SelectItem>
            <SelectItem value="8th">8th graders</SelectItem>
          </SelectContent>
        </Select>
        <span>something about</span>
        <Select defaultValue="science">
          <SelectTrigger className="w-[180px] bg-white">
            <SelectValue placeholder="Select subject" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="science">Science</SelectItem>
            <SelectItem value="math">Math</SelectItem>
            <SelectItem value="history">History</SelectItem>
          </SelectContent>
        </Select>
        <span>and</span>
        <Input className="w-[180px] bg-white" placeholder="Plants" />
      </div>
      <Button className="bg-black text-white hover:bg-black/90">Generate ideas</Button>
    </div>
  )
}

