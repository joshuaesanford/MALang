# MALang README.md

Currently in development, fulfilling the following specification.

MABasic Specification
The MusicaAxiomatica input language is designed to enable efficient notation of musical information, with a focus on visual simplicity and conceptual elegance. Any musician who faithfully uses the MA language will find that it is designed with long term musical growth in mind.
The MusicaAxiomatica language focuses on four basic musical objects ordered within a musical voice.
A voice is a stream of musical objects, delimited by open and closed curly braces. A general definition is given below.

     voice object   :   { collection of duration objects }

In mathematics, curly braces are used to denote sets. Similarly, in the MA language, a voice represents a set of musical objects that each possess the property of duration.
At any given moment, only one musical object can be active within a voice. Refining our definition further, a voice is a series of musical objects that unfold over time, one after the other.
The MA language focuses on the chromatic scale. Instead of traditional note names, we define the home pitch and use numbers 1 through 12 to indicate the notes relative to the key center. While it may seem like a lot of effort, it is standard practice to refer to scale degrees using numbers - though we encourage base-12 as opposed to base-7. It does not take long to get used to a base-12 number system. Additionally, the names of the 12 numbers easily work as solfeggio syllables (e.g. "one, two, three, four, five, six, sev, eight, nine, ten, lev, twelve"). The MA philosophy is to utilize systems which will improve long term musicianship. As a musician devotes more time to contemplating home pitches and their base-12 note numbers, they will become increasingly adept at discovering musical relationships across all key centers. It is vitally important to become conversant in both base-12 and base-7. Base-7 allows for the consideration of intervals that have shared qualities relative to common scales and chords, but it forces the musician to move conceptually between major and minor contexts. Base-12 forces the musician to "understand the 12 notes from each of the 12 notes". Any understanding developed using base-7 can be assimilated under base-12 while increasing the universality and elegance of one's musical thinking.

Example #1:  A block of code demonstrating global assignments and a voice containing the four different types of musical objects.

     ; Text after semi-colons are line comments.
     (set_home_pitch c)
     (set_clef soprano)
     (set_tempo_in_whole_beats 30)
     (set_measure_in_whole_beats 1)
     { 5[1/4], 3<10/6/4>[1/4], <8/5>[1/4], [1/4] }

This example is meant to introduce you to the four main types of musical objects.

Pitch Duration:                A pitch and duration but no figuration (figurations are harmony notes above a pitch)

Figured Bass Duration:   A pitch, figuration, and duration

Figuration Duration:       A figuration and duration but no pitch

Rest Duration:                A duration without a pitch or figuration

The first object 5[1/4] is a Pitch Duration. The pitch value is the first component of a musical object that may be encountered when scanning a voice from left to right. The pitch value follows immediately after an opening curly brace (the beginning of the voice) or a comma (the separator between objects). Observe that the pitch is not enclosed within any type of brackets. The pitch value is a number between 1 and 12, representing a note in the chromatic scale where the HOME note is defined as

1. In this example (given that HOME = C), the set of pitches is as follows:

     { C = 1, C#/Db = 2, D = 3, D#/Eb = 4, E = 5, F = 6, F#/Gb = 7, G = 8, G#/Ab = 9, A = 10, A#/Bb = 11, B = 12 }

Therefore, the four pitch values in example #1 are { E, D, None, None }. It's important to note that the third and fourth elements do not have pitch values. Pitches are not required elements of a musical object.

The pitch duration includes a duration value, indicated by the [1/4] part of the pitch duration. These duration values are enclosed in square brackets. All duration values consist of two non-zero counting numbers. The number before the slash indicates the duration numerator whereas the number after the slash indicates the duration denominator. In MusicaAxiomatica, all duration values are expressed relative to the whole note which has a value of 1 or [1/1]. Think of the whole note as a pie chart representing the entirety of a circle. The duration denominator indicates the number of even divisions of the whole note. The duration numerator specifies the number of these divisions that the particular duration occupies. Therefore, a duration value of [1/1] means that the whole note is divided into one segment and lasts for the duration of one of those segments (i.e. the duration is one whole note). In example #1, all of the duration values are [1/4], indicating that the beat should be divided into four subbeats and that the duration lasts for one of these quarter-notes.

The duration value can be left blank `[]' and an appending function can be used to allow for real-valued durations. This topic goes beyond the MABasic specification, however I will offer some insight into my thinking. MusicaAxiomatica prefers working with accents and additive rhythms rather than time signatures. Expressing all duration values relative to the whole beat allows us to have a consistent way of viewing rhythms. We find accents and additive rhythms to be more conducive to creative expression. I set the speed of the music relative to the whole beat because of personal preference - other functions are available for setting and getting such values relative to other beat types. For instance, a moderate quarter note tempo of 120 quarter beats per minute (the same tempo as in example 1) can be set using the tempo assignment (set-tempo-in-quarter-beats 120). This means that the tempo is now 120 quarter beats per minute, establishing the relative speed of all other duration values. For example, (get-tempo whole-beats) would then return 30. The frequency of measure lines can be set using the (set-measure-in-TYPE-beats LENGTH) construct, where the value of TYPE is a beat type, and LENGTH is some whole number, rational fraction, or real-valued number. In example #1, (set-measure-in-whole-beats 1) indicates that a measure line will be drawn at GlobalTime = 1/30 min, 2/30 min, 3/30 min, etc. Note: functions can be appended to the end of musical objects in order to perform processing, such as simply redefining basic assignments. More advanced uses of the function component will be defined in the complete MALang specification.

A pitch's default octave value is always its closest instance to the center of the staff. Thus, the chosen clef determines the default octave for a pitch value because it determines the pitch that sits at the center of the staff. To shift a pitch value up or down in relation to its default octave placement, use the '+' and '-' characters before the pitch value (such as +1[1/4] or -1[1/4]). Note that this language construct necessitates the understanding of clefs. A strong understanding of clefs will benefit the musician in the long run. As a musician advances in their partimento studies, they will discover that shifting clefs can imply contrapuntal material with shockingly minimal notation.

The second object 3<10/6/4>[1/4] indicates a figured bass duration. The only new concept here is the figuration values enclosed within the angle brackets. Figurations are harmonic pitches above the musical object's pitch value. The most important detail about figuration values is that they are relative to the pitch value, not to the home pitch. In other words, the figuration values function as if the musical object's pitch value sets the home key for the figuration values. Thus, in the figured bass duration 3<10/6/4>[1/4], the pitch is D (home key is C) with harmony notes 10 = B, 6 = G, 4 = F (all relative to D). In chord notation this is a G7/D. The figuration values are given in order from highest pitch to lowest pitch. The purpose of this notation construct is to make it easier for musicians to quickly read and interpret the music. When a musician reads quickly, the first two notes that their eyes will encounter are the bass note and the melody note. Counterpoint between bass and melody forms the bedrock of musical composition. Inner parts are often less important and serve more as filler material unless the musician is working with complex counterpoint.

Additionally, a general figured pitch duration can have figurations above and below the pitch (a minus sign indicates a figuration value should be in the first position below the pitch value). If a plus sign is used, it indicates that the figuration should be an octave above its first position above the pitch. Obviously, iteratively using the plus and minus symbols increases or decreases the octave level accordingly. A figured melody duration is acheived when all the figuration values are specifically defined (using minus symbols) to be below the pitch. (This term is contingent on the current voice's pitch being the highest pitch out of all of the voices in the composition at that particular moment - just as the term `figured bass duration' is contingent on the given pitch being the lowest pitch in the composition at the given moment). These types of objects can allow you to specify a lot of information in just one musical voice.

The third object <8/5>[1/4] indicates a figuration duration. The only new detail here is that it is possible for a voice to include an object that has a figuration but no bass pitch. Figuration durations will have to get their bass pitch from another voice. This is a good time to point out that voice sequences can be built up in separate text files and then compiled together into one musical piece. This is made possible by requiring that each musical object in a voice must always possess a duration. Global time always increases from one musical object to the next. Each voice sequence builds up its own global time with its musical objects placed within that timeline. This makes it trivially easy to combine multiple voices from multiple text files. It is simple and convenient to have four text editor instances open in the four quadrants of one's computer screen. This makes it easy to compose in multiple voices while keeping the workflow under control. I am personally excited to explore the possibilities of this type of musical object. Extended language features offer opportunity for experimentation.
The last object [1/4] is simply a rest duration. That is, a duration without any sound.

The MusicaAxiomatica input language will allow for extended functionality by adding a fourth component to the musical object. Content can be enclosed within parentheses at the end of a musical object (before a comma or closing curly brace). This is known as the function component. A generic example is provided below.

     { PITCH_VALUE<FIGURATION_VALUES>[DURATION_VALUES](FUNCTION_CONTENT) }

END OF DOCUMENTATION FOR MABasic
