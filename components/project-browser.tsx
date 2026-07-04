"use client"

import { useState } from "react"
import { Selector } from "@astryxdesign/core/Selector"

export function ProjectBrowser() {
  const [grade, setGrade] = useState("all")
  const [subject, setSubject] = useState("all")

  return (
    <div className="space-y-6">
      <div className="flex gap-4">
        <Selector
          label="Grade level"
          value={grade}
          onChange={setGrade}
          options={[
            { value: "all", label: "All" },
            { value: "6th", label: "6th Grade" },
            { value: "7th", label: "7th Grade" },
          ]}
          className="w-[180px]"
        />
        <Selector
          label="Subject"
          value={subject}
          onChange={setSubject}
          options={[
            { value: "all", label: "All" },
            { value: "science", label: "Science" },
            { value: "math", label: "Math" },
          ]}
          className="w-[180px]"
        />
      </div>
    </div>
  )
}
