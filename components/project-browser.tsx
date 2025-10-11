"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function ProjectBrowser() {
  return (
    <div className="space-y-6">
      <div className="flex gap-4">
        <div className="space-y-2">
          <label className="text-sm text-[#49454f]">Grade level</label>
          <Select defaultValue="all">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select grade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="6th">6th Grade</SelectItem>
              <SelectItem value="7th">7th Grade</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <label className="text-sm text-[#49454f]">Subject</label>
          <Select defaultValue="all">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select subject" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="science">Science</SelectItem>
              <SelectItem value="math">Math</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}

