"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Selector } from "@astryxdesign/core/Selector"
import { TextInput } from "@astryxdesign/core/TextInput"

export function ProjectCreator() {
  const [topic, setTopic] = useState("Plants")
  const [grade, setGrade] = useState("6th")
  const [subject, setSubject] = useState("science")
  return (
    <div className="bg-[#e8def8] rounded-lg p-8 space-y-6">
      <div className="flex flex-wrap gap-4 items-center">
        <span>I want to use AI to teach my</span>
        <Selector
          label="Grade"
          isLabelHidden
          value={grade}
          onChange={setGrade}
          options={[
            { value: "6th", label: "6th graders" },
            { value: "7th", label: "7th graders" },
            { value: "8th", label: "8th graders" },
          ]}
          className="w-[180px] bg-white"
        />
        <span>something about</span>
        <Selector
          label="Subject"
          isLabelHidden
          value={subject}
          onChange={setSubject}
          options={[
            { value: "science", label: "Science" },
            { value: "math", label: "Math" },
            { value: "history", label: "History" },
          ]}
          className="w-[180px] bg-white"
        />
        <span>and</span>
        <TextInput
          label="Topic"
          isLabelHidden
          value={topic}
          onChange={setTopic}
          className="w-[180px] bg-white"
          placeholder="Plants"
        />
      </div>
      <Button>Generate ideas</Button>
    </div>
  )
}

